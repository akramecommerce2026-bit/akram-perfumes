import { MockProductRepository } from "@/services/repositories/mock-product-repository";
import type { ProductRepository } from "@/services/repositories/product-repository";

export type { ProductRepository } from "@/services/repositories/product-repository";

let instance: ProductRepository | null = null;

/**
 * Single point of control for the catalogue data source.
 *
 * Today it returns the mock repository. To go live on Supabase, this is the ONLY
 * place that changes — e.g. return a `SupabaseProductRepository` (optionally
 * gated behind an env flag). The service and every UI component stay untouched.
 */
export function getProductRepository(): ProductRepository {
  if (!instance) {
    instance = new MockProductRepository();
  }
  return instance;
}
