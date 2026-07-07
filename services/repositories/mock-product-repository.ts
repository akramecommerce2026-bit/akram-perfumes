import { categoryRecords } from "@/lib/categories";
import { productRecords, variantRecords } from "@/lib/products";
import type { Category } from "@/types/category";
import type { ProductRecord } from "@/types/product";
import type { ProductVariant } from "@/types/variant";
import type { ProductRepository } from "@/services/repositories/product-repository";

/**
 * In-memory implementation of ProductRepository backed by mock data.
 *
 * Methods return Promises (not because the data is async, but so the interface
 * matches a future network-backed Supabase implementation exactly). When we
 * migrate, only this file is replaced.
 */
export class MockProductRepository implements ProductRepository {
  findAllProducts(): Promise<readonly ProductRecord[]> {
    return Promise.resolve(productRecords);
  }

  findProductById(id: string): Promise<ProductRecord | null> {
    return Promise.resolve(productRecords.find((product) => product.id === id) ?? null);
  }

  findProductBySlug(slug: string): Promise<ProductRecord | null> {
    return Promise.resolve(productRecords.find((product) => product.slug === slug) ?? null);
  }

  findAllVariants(): Promise<readonly ProductVariant[]> {
    return Promise.resolve(variantRecords);
  }

  findVariantsByProductId(productId: string): Promise<readonly ProductVariant[]> {
    return Promise.resolve(variantRecords.filter((variant) => variant.productId === productId));
  }

  findAllCategories(): Promise<readonly Category[]> {
    return Promise.resolve(categoryRecords);
  }

  findCategoryById(id: string): Promise<Category | null> {
    return Promise.resolve(categoryRecords.find((category) => category.id === id) ?? null);
  }

  findCategoryBySlug(slug: string): Promise<Category | null> {
    return Promise.resolve(categoryRecords.find((category) => category.slug === slug) ?? null);
  }
}
