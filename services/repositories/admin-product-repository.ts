import type { ProductFormValues } from "@/lib/admin/product-schema";
import type {
  AdminProductDetail,
  AdminProductListResult,
  AdminProductQuery,
} from "@/types/admin-product";

/**
 * Write + read contract for admin product management (Dependency Inversion).
 * The admin product service depends on this, never a concrete data source.
 * Implemented today by the Supabase service-role repository.
 */
export interface AdminProductRepository {
  list(query: AdminProductQuery): Promise<AdminProductListResult>;
  getById(id: string): Promise<AdminProductDetail | null>;
  create(input: ProductFormValues): Promise<string>;
  update(id: string, input: ProductFormValues): Promise<void>;
  /** Soft delete: sets deleted_at and deactivates so the storefront hides them. */
  softDelete(ids: readonly string[]): Promise<void>;
  setActive(ids: readonly string[], active: boolean): Promise<void>;
}

export const DEFAULT_ADMIN_PAGE_SIZE = 10;
