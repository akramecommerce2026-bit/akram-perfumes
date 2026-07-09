import type { CategoryFormValues } from "@/lib/admin/category-schema";
import type {
  AdminCategoryDetail,
  AdminCategoryListResult,
  AdminCategoryQuery,
} from "@/types/admin-category";

/**
 * Write + read contract for admin category management (Dependency Inversion).
 * Mirrors AdminProductRepository. Implemented by the Supabase service-role
 * repository. Duplicate name/slug conflicts surface as thrown errors with
 * user-facing messages.
 */
export interface AdminCategoryRepository {
  list(query: AdminCategoryQuery): Promise<AdminCategoryListResult>;
  getById(id: string): Promise<AdminCategoryDetail | null>;
  create(input: CategoryFormValues): Promise<string>;
  update(id: string, input: CategoryFormValues): Promise<void>;
  /** Soft delete: sets deleted_at + hides. Caller must ensure it has no products. */
  softDelete(id: string): Promise<void>;
  /** Count of non-deleted products in a category (for the delete guard + list). */
  getProductCount(id: string): Promise<number>;
}

export const DEFAULT_CATEGORY_PAGE_SIZE = 10;
