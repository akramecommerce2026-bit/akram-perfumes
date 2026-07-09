import "server-only";

import type { CategoryFormValues } from "@/lib/admin/category-schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/database.types";
import {
  DEFAULT_CATEGORY_PAGE_SIZE,
  type AdminCategoryRepository,
} from "@/services/repositories/admin-category-repository";
import type {
  AdminCategoryDetail,
  AdminCategoryListItem,
  AdminCategoryListResult,
  AdminCategoryQuery,
  CategoryStatus,
} from "@/types/admin-category";

/**
 * Supabase-backed admin category repository (service-role, server-only). Owns
 * category writes and the product-count aggregation shown in the admin. Product
 * counts are derived in a single query (no per-row round-trips).
 */
export class SupabaseAdminCategoryRepository implements AdminCategoryRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async list(query: AdminCategoryQuery): Promise<AdminCategoryListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.pageSize ?? DEFAULT_CATEGORY_PAGE_SIZE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let request = this.db
      .from("categories")
      .select("*", { count: "exact" })
      .is("deleted_at", null);

    if (query.search?.trim()) request = request.ilike("name", `%${query.search.trim()}%`);

    if (query.sort === "name") request = request.order("name", { ascending: true });
    else request = request.order("created_at", { ascending: query.sort === "oldest" });

    request = request.range(from, to);

    const { data, count, error } = await request;
    if (error) throw error;

    const counts = await this.productCountsByCategory();
    const total = count ?? 0;

    return {
      items: (data ?? []).map((row) => mapListItem(row, counts.get(row.id) ?? 0)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getById(id: string): Promise<AdminCategoryDetail | null> {
    const { data, error } = await this.db
      .from("categories")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapDetail(data, await this.getProductCount(id));
  }

  async create(input: CategoryFormValues): Promise<string> {
    await this.assertNoConflict(input.name, input.slug, null);
    const id = `cat_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

    const { error } = await this.db.from("categories").insert({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      image_url: input.imageUrl || null,
      meta_title: input.metaTitle || null,
      meta_description: input.metaDescription || null,
      active: input.active,
    });
    if (error) throw error;
    return id;
  }

  async update(id: string, input: CategoryFormValues): Promise<void> {
    await this.assertNoConflict(input.name, input.slug, id);
    const { error } = await this.db
      .from("categories")
      .update({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        image_url: input.imageUrl || null,
        meta_title: input.metaTitle || null,
        meta_description: input.metaDescription || null,
        active: input.active,
      })
      .eq("id", id);
    if (error) throw error;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.db
      .from("categories")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", id);
    if (error) throw error;
  }

  async getProductCount(id: string): Promise<number> {
    const { count, error } = await this.db
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id)
      .is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  }

  // --- helpers ------------------------------------------------------------

  /** Non-deleted product counts grouped by category, in one query. */
  private async productCountsByCategory(): Promise<Map<string, number>> {
    const { data, error } = await this.db
      .from("products")
      .select("category_id")
      .is("deleted_at", null);
    if (error) throw error;

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
    }
    return counts;
  }

  /** Throws a friendly error if another non-deleted category shares the name/slug. */
  private async assertNoConflict(name: string, slug: string, excludeId: string | null) {
    const { data, error } = await this.db
      .from("categories")
      .select("id, name, slug")
      .is("deleted_at", null);
    if (error) throw error;

    for (const row of data ?? []) {
      if (excludeId && row.id === excludeId) continue;
      if (row.name.toLowerCase() === name.toLowerCase()) {
        throw new Error("A category with this name already exists.");
      }
      if (row.slug === slug) {
        throw new Error("A category with this slug already exists.");
      }
    }
  }
}

function mapListItem(row: Tables<"categories">, productCount: number): AdminCategoryListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    productCount,
    status: (row.active ? "active" : "hidden") as CategoryStatus,
    createdAt: row.created_at,
  };
}

function mapDetail(row: Tables<"categories">, productCount: number): AdminCategoryDetail {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    active: row.active,
    productCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
