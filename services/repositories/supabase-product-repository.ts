import { getSupabaseClient, type AkramSupabaseClient } from "@/lib/supabase/client";
import { mapCategory, mapProduct, mapVariant } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/database.types";
import type { ProductRepository } from "@/services/repositories/product-repository";
import type { Category } from "@/types/category";
import type { ProductRecord } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Supabase-backed implementation of ProductRepository.
 *
 * Returns the exact same domain records as MockProductRepository, so the
 * service and UI layers are unchanged. RLS already limits the anon client to
 * active catalogue rows; the queries are additionally explicit for clarity.
 */
export class SupabaseProductRepository implements ProductRepository {
  private get db(): AkramSupabaseClient {
    return getSupabaseClient();
  }

  async findAllProducts(): Promise<readonly ProductRecord[]> {
    const { data: products, error } = await this.db
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!products || products.length === 0) return [];

    const ids = products.map((product) => product.id);
    const [images, notes] = await Promise.all([
      this.fetchImages(ids),
      this.fetchNotes(ids),
    ]);

    return products.map((product) =>
      mapProduct(product, groupByProduct(images, product.id), groupByProduct(notes, product.id)),
    );
  }

  async findProductById(id: string): Promise<ProductRecord | null> {
    return this.findOneProduct("id", id);
  }

  async findProductBySlug(slug: string): Promise<ProductRecord | null> {
    return this.findOneProduct("slug", slug);
  }

  async findAllVariants(): Promise<readonly ProductVariant[]> {
    const { data, error } = await this.db
      .from("product_variants")
      .select("*")
      .eq("status", "active")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapVariant);
  }

  async findVariantsByProductId(productId: string): Promise<readonly ProductVariant[]> {
    const { data, error } = await this.db
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "active")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapVariant);
  }

  async findAllCategories(): Promise<readonly Category[]> {
    const { data, error } = await this.db
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapCategory);
  }

  async findCategoryById(id: string): Promise<Category | null> {
    return this.findOneCategory("id", id);
  }

  async findCategoryBySlug(slug: string): Promise<Category | null> {
    return this.findOneCategory("slug", slug);
  }

  // --- helpers ------------------------------------------------------------

  private async findOneProduct(
    column: "id" | "slug",
    value: string,
  ): Promise<ProductRecord | null> {
    const { data: product, error } = await this.db
      .from("products")
      .select("*")
      .eq(column, value)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (!product) return null;

    const [images, notes] = await Promise.all([
      this.fetchImages([product.id]),
      this.fetchNotes([product.id]),
    ]);
    return mapProduct(product, images, notes);
  }

  private async findOneCategory(
    column: "id" | "slug",
    value: string,
  ): Promise<Category | null> {
    const { data, error } = await this.db
      .from("categories")
      .select("*")
      .eq(column, value)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCategory(data) : null;
  }

  private async fetchImages(productIds: readonly string[]): Promise<Tables<"product_images">[]> {
    const { data, error } = await this.db
      .from("product_images")
      .select("*")
      .in("product_id", productIds);
    if (error) throw error;
    return data ?? [];
  }

  private async fetchNotes(productIds: readonly string[]): Promise<Tables<"fragrance_notes">[]> {
    const { data, error } = await this.db
      .from("fragrance_notes")
      .select("*")
      .in("product_id", productIds);
    if (error) throw error;
    return data ?? [];
  }
}

function groupByProduct<T extends { product_id: string }>(
  rows: readonly T[],
  productId: string,
): T[] {
  return rows.filter((row) => row.product_id === productId);
}
