import "server-only";

import {
  rupeesToPaise,
  type ProductFormValues,
  type VariantFormValues,
} from "@/lib/admin/product-schema";
import { deleteProductImageByUrl } from "@/lib/admin/product-images";
import { createMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase/database.types";
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  type AdminProductRepository,
} from "@/services/repositories/admin-product-repository";
import type {
  AdminImage,
  AdminProductDetail,
  AdminProductListItem,
  AdminProductListResult,
  AdminProductQuery,
  AdminVariant,
  ProductStatus,
  StockStatus,
} from "@/types/admin-product";

const LIST_SELECT =
  "id,name,slug,brand,category_id,featured_image,is_featured,active,created_at," +
  "category:categories(name)," +
  "variants:product_variants(price,stock,status,sku,display_order,low_stock_threshold)";

const DETAIL_SELECT =
  "*, variants:product_variants(*), images:product_images(*), notes:fragrance_notes(*)";

/**
 * Supabase-backed admin product repository (service-role, server-only). Owns all
 * catalogue writes — product + variants + notes + images are reconciled together
 * so the admin form is the single edit surface. Prices are entered in rupees and
 * stored as integer paise.
 */
export class SupabaseAdminProductRepository implements AdminProductRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async list(query: AdminProductQuery): Promise<AdminProductListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.pageSize ?? DEFAULT_ADMIN_PAGE_SIZE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let request = this.db
      .from("products")
      .select(LIST_SELECT, { count: "exact" })
      .is("deleted_at", null);

    if (query.search?.trim()) request = request.ilike("name", `%${query.search.trim()}%`);
    if (query.categoryId) request = request.eq("category_id", query.categoryId);
    if (query.status === "active") request = request.eq("active", true);
    if (query.status === "draft") request = request.eq("active", false);

    request = request
      .order("created_at", { ascending: query.sort === "oldest" })
      .range(from, to);

    const { data, count, error } = await request;
    if (error) throw error;

    const total = count ?? 0;
    return {
      items: ((data ?? []) as unknown as ListRow[]).map(mapListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getById(id: string): Promise<AdminProductDetail | null> {
    const { data, error } = await this.db
      .from("products")
      .select(DETAIL_SELECT)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapDetail(data) : null;
  }

  async create(input: ProductFormValues): Promise<string> {
    const id = newId("prod");
    const featuredImage = primaryImageUrl(input);

    const { error } = await this.db.from("products").insert({
      id,
      name: input.name,
      slug: input.slug,
      category_id: input.categoryId,
      short_description: input.shortDescription ?? "",
      description: input.description ?? "",
      featured_image: featuredImage,
      gender: input.gender,
      fragrance_family: input.fragranceFamily,
      concentration: input.concentration ?? "",
      brand: input.brand,
      is_featured: input.isFeatured,
      active: input.active,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      keywords: input.keywords,
      og_image: input.ogImage || null,
    });
    if (error) throw error;

    await this.writeVariants(id, input.variants);
    await this.writeNotes(id, input);
    await this.writeImages(id, input, []);
    return id;
  }

  async update(id: string, input: ProductFormValues): Promise<void> {
    const featuredImage = primaryImageUrl(input);

    const { error } = await this.db
      .from("products")
      .update({
        name: input.name,
        slug: input.slug,
        category_id: input.categoryId,
        short_description: input.shortDescription ?? "",
        description: input.description ?? "",
        featured_image: featuredImage,
        gender: input.gender,
        fragrance_family: input.fragranceFamily,
        concentration: input.concentration ?? "",
        brand: input.brand,
        is_featured: input.isFeatured,
        active: input.active,
        meta_title: input.metaTitle || null,
        meta_description: input.metaDescription || null,
        keywords: input.keywords,
        og_image: input.ogImage || null,
      })
      .eq("id", id);
    if (error) throw error;

    await this.reconcileVariants(id, input.variants);
    await this.writeNotes(id, input, true);

    const { data: existingImages } = await this.db
      .from("product_images")
      .select("id,url")
      .eq("product_id", id);
    await this.writeImages(id, input, existingImages ?? []);
  }

  async softDelete(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await this.db
      .from("products")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .in("id", [...ids]);
    if (error) throw error;
  }

  async setActive(ids: readonly string[], active: boolean): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await this.db.from("products").update({ active }).in("id", [...ids]);
    if (error) throw error;
  }

  // --- writes -------------------------------------------------------------

  private async writeVariants(productId: string, variants: readonly VariantFormValues[]) {
    const rows = variants.map((variant, index) => variantRow(productId, variant, index));
    const { error } = await this.db.from("product_variants").insert(rows);
    if (error) throw error;
  }

  private async reconcileVariants(productId: string, variants: readonly VariantFormValues[]) {
    const keepIds = new Set(variants.map((v) => v.id).filter(Boolean) as string[]);
    const { data: existing } = await this.db
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !keepIds.has(id));
    if (toDelete.length > 0) {
      const { error } = await this.db.from("product_variants").delete().in("id", toDelete);
      if (error) throw error;
    }

    const rows = variants.map((variant, index) => variantRow(productId, variant, index));
    const { error } = await this.db.from("product_variants").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  private async writeNotes(productId: string, input: ProductFormValues, replace = false) {
    if (replace) {
      await this.db.from("fragrance_notes").delete().eq("product_id", productId);
    }
    const rows: TablesInsert<"fragrance_notes">[] = [
      ...input.topNotes.map((note, i) => noteRow(productId, "top", note, i)),
      ...input.heartNotes.map((note, i) => noteRow(productId, "heart", note, i)),
      ...input.baseNotes.map((note, i) => noteRow(productId, "base", note, i)),
    ];
    if (rows.length > 0) {
      const { error } = await this.db.from("fragrance_notes").insert(rows);
      if (error) throw error;
    }
  }

  private async writeImages(
    productId: string,
    input: ProductFormValues,
    existing: readonly { id: string; url: string }[],
  ) {
    const keepIds = new Set(input.images.map((i) => i.id).filter(Boolean) as string[]);
    const removed = existing.filter((row) => !keepIds.has(row.id));
    if (removed.length > 0) {
      await this.db.from("product_images").delete().in(
        "id",
        removed.map((r) => r.id),
      );
      await Promise.all(removed.map((r) => deleteProductImageByUrl(r.url)));
    }

    const withId = input.images
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => Boolean(img.id));
    const withoutId = input.images
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => !img.id);

    if (withId.length > 0) {
      const rows = withId.map(({ img, index }) => ({
        id: img.id!,
        product_id: productId,
        url: img.url,
        alt: img.alt ?? "",
        is_primary: img.isPrimary,
        display_order: index,
      }));
      const { error } = await this.db.from("product_images").upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }
    if (withoutId.length > 0) {
      const rows = withoutId.map(({ img, index }) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt ?? "",
        is_primary: img.isPrimary,
        display_order: index,
      }));
      const { error } = await this.db.from("product_images").insert(rows);
      if (error) throw error;
    }
  }
}

// --- mapping ----------------------------------------------------------------

interface ListRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category_id: string;
  featured_image: string;
  is_featured: boolean;
  active: boolean;
  created_at: string;
  category: { name: string } | null;
  variants: {
    price: number;
    stock: number;
    status: string;
    sku: string;
    display_order: number;
    low_stock_threshold: number;
  }[];
}

function mapListItem(row: ListRow): AdminProductListItem {
  const variants = [...row.variants].sort((a, b) => a.display_order - b.display_order);
  const active = variants.filter((v) => v.status === "active");
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const lowestPaise = active.length > 0 ? Math.min(...active.map((v) => v.price)) : null;

  const stockStatus: StockStatus =
    totalStock === 0
      ? "out_of_stock"
      : active.some((v) => v.stock <= v.low_stock_threshold)
        ? "low_stock"
        : "in_stock";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    categoryId: row.category_id,
    categoryName: row.category?.name ?? "Uncategorized",
    featuredImage: row.featured_image,
    sku: variants[0]?.sku ?? null,
    price: lowestPaise != null ? createMoney(lowestPaise) : null,
    status: (row.active ? "active" : "draft") as ProductStatus,
    stockStatus,
    totalStock,
    variantCount: variants.length,
    isFeatured: row.is_featured,
    createdAt: row.created_at,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDetail(row: any): AdminProductDetail {
  const variants: AdminVariant[] = [...(row.variants ?? [])]
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((v: any) => ({
      id: v.id,
      variantName: v.variant_name,
      price: createMoney(v.price),
      comparePrice: v.compare_price != null ? createMoney(v.compare_price) : null,
      sku: v.sku,
      stock: v.stock,
      lowStockThreshold: v.low_stock_threshold,
      status: v.status,
      displayOrder: v.display_order,
    }));

  const images: AdminImage[] = [...(row.images ?? [])]
    .sort((a: any, b: any) => a.display_order - b.display_order)
    .map((i: any) => ({
      id: i.id,
      url: i.url,
      alt: i.alt ?? "",
      isPrimary: i.is_primary,
      displayOrder: i.display_order,
    }));

  const notes = [...(row.notes ?? [])].sort((a: any, b: any) => a.display_order - b.display_order);
  const byType = (type: string) =>
    notes.filter((n: any) => n.note_type === type).map((n: any) => n.note as string);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    categoryId: row.category_id,
    brand: row.brand,
    gender: row.gender,
    concentration: row.concentration,
    fragranceFamily: row.fragrance_family,
    isFeatured: row.is_featured,
    active: row.active,
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    keywords: row.keywords ?? [],
    ogImage: row.og_image ?? "",
    featuredImage: row.featured_image,
    variants,
    notes: { top: byType("top"), heart: byType("heart"), base: byType("base") },
    images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- row builders -----------------------------------------------------------

function variantRow(
  productId: string,
  variant: VariantFormValues,
  order: number,
): TablesInsert<"product_variants"> {
  return {
    id: variant.id ?? newId("var"),
    product_id: productId,
    variant_name: variant.variantName,
    price: rupeesToPaise(variant.price),
    compare_price:
      variant.comparePrice && variant.comparePrice > 0 ? rupeesToPaise(variant.comparePrice) : null,
    currency: "INR",
    sku: variant.sku,
    stock: variant.stock,
    low_stock_threshold: variant.lowStockThreshold,
    status: variant.active ? "active" : "inactive",
    display_order: order,
  };
}

function noteRow(
  productId: string,
  type: "top" | "heart" | "base",
  note: string,
  order: number,
): TablesInsert<"fragrance_notes"> {
  return { product_id: productId, note_type: type, note, display_order: order };
}

function primaryImageUrl(input: ProductFormValues): string {
  const primary = input.images.find((i) => i.isPrimary) ?? input.images[0];
  return primary?.url ?? "";
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
