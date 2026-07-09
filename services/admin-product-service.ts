import "server-only";

import type { ProductFormValues } from "@/lib/admin/product-schema";
import type { AdminProductRepository } from "@/services/repositories/admin-product-repository";
import { SupabaseAdminProductRepository } from "@/services/repositories/supabase-admin-product-repository";
import type {
  AdminProductDetail,
  AdminProductListResult,
  AdminProductQuery,
} from "@/types/admin-product";

/**
 * Product-management service for the admin area. Depends only on the
 * AdminProductRepository abstraction; consumed by server actions and admin
 * Server Components (never public code — hence `server-only`).
 */
export class AdminProductService {
  constructor(private readonly repository: AdminProductRepository) {}

  list(query: AdminProductQuery): Promise<AdminProductListResult> {
    return this.repository.list(query);
  }

  getById(id: string): Promise<AdminProductDetail | null> {
    return this.repository.getById(id);
  }

  create(input: ProductFormValues): Promise<string> {
    return this.repository.create(input);
  }

  update(id: string, input: ProductFormValues): Promise<void> {
    return this.repository.update(id, input);
  }

  softDelete(ids: readonly string[]): Promise<void> {
    return this.repository.softDelete(ids);
  }

  setActive(ids: readonly string[], active: boolean): Promise<void> {
    return this.repository.setActive(ids, active);
  }
}

export const adminProductService = new AdminProductService(new SupabaseAdminProductRepository());
