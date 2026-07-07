import type { Category } from "@/types/category";
import type { ProductRecord } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Data-access contract for the catalogue (Dependency Inversion).
 *
 * The service layer depends on this interface, never on a concrete data source.
 * `MockProductRepository` implements it today; a `SupabaseProductRepository`
 * will implement the same methods tomorrow. All methods are async so the mock
 * and the eventual network-backed implementation share one signature.
 */
export interface ProductRepository {
  findAllProducts(): Promise<readonly ProductRecord[]>;
  findProductById(id: string): Promise<ProductRecord | null>;
  findProductBySlug(slug: string): Promise<ProductRecord | null>;

  findAllVariants(): Promise<readonly ProductVariant[]>;
  findVariantsByProductId(productId: string): Promise<readonly ProductVariant[]>;

  findAllCategories(): Promise<readonly Category[]>;
  findCategoryById(id: string): Promise<Category | null>;
  findCategoryBySlug(slug: string): Promise<Category | null>;
}
