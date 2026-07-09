import "server-only";

import type { CategoryFormValues } from "@/lib/admin/category-schema";
import type { AdminCategoryRepository } from "@/services/repositories/admin-category-repository";
import { SupabaseAdminCategoryRepository } from "@/services/repositories/supabase-admin-category-repository";
import type {
  AdminCategoryDetail,
  AdminCategoryListResult,
  AdminCategoryQuery,
} from "@/types/admin-category";

/**
 * Category-management service for the admin area. Depends only on the
 * AdminCategoryRepository abstraction; consumed by server actions and admin
 * Server Components (server-only).
 */
export class AdminCategoryService {
  constructor(private readonly repository: AdminCategoryRepository) {}

  list(query: AdminCategoryQuery): Promise<AdminCategoryListResult> {
    return this.repository.list(query);
  }

  getById(id: string): Promise<AdminCategoryDetail | null> {
    return this.repository.getById(id);
  }

  create(input: CategoryFormValues): Promise<string> {
    return this.repository.create(input);
  }

  update(id: string, input: CategoryFormValues): Promise<void> {
    return this.repository.update(id, input);
  }

  /** Soft delete, guarded: a category that still contains products cannot go. */
  async delete(id: string): Promise<void> {
    const productCount = await this.repository.getProductCount(id);
    if (productCount > 0) {
      throw new Error(
        `This category still contains ${productCount} product${productCount === 1 ? "" : "s"}. ` +
          "Reassign or remove them before deleting the category.",
      );
    }
    await this.repository.softDelete(id);
  }
}

export const adminCategoryService = new AdminCategoryService(new SupabaseAdminCategoryRepository());
