import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MockProductRepository } from "@/services/repositories/mock-product-repository";
import { SupabaseProductRepository } from "@/services/repositories/supabase-product-repository";
import type { ProductRepository } from "@/services/repositories/product-repository";

export type { ProductRepository } from "@/services/repositories/product-repository";

let instance: ProductRepository | null = null;

/**
 * Single point of control for the catalogue data source.
 *
 * Returns the Supabase-backed repository when Supabase is configured (env vars
 * present), and falls back to the in-memory mock otherwise — so the app always
 * builds and runs, and switches to the live backend with zero code changes once
 * credentials are provided. The service and every UI component stay untouched.
 */
export function getProductRepository(): ProductRepository {
  if (!instance) {
    instance = isSupabaseConfigured()
      ? new SupabaseProductRepository()
      : new MockProductRepository();
  }
  return instance;
}
