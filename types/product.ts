import type { Category } from "@/types/category";
import type { Money } from "@/types/money";
import type { ProductVariant } from "@/types/variant";

/**
 * Persistence shape of a product — mirrors a future Supabase `products` row.
 * Uses a `categoryId` foreign key rather than an embedded category, and does
 * not embed variants. Repositories return records; the service composes them
 * into the read models below. UI code never touches `ProductRecord`.
 */
export interface ProductRecord {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryId: string;
  readonly description: string;
  readonly featuredImage: string;
  readonly galleryImages: readonly string[];
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
  /** ISO 8601 timestamp. */
  readonly updatedAt: string;
}

/**
 * Full product read model used by the Product page — category resolved and
 * (customer-facing) active variants embedded and ordered.
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: Category;
  readonly description: string;
  readonly featuredImage: string;
  readonly galleryImages: readonly string[];
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly variants: readonly ProductVariant[];
}

/**
 * Lightweight read model used by listings (Shop grid, Featured, Signature).
 * Avoids shipping every variant to the client for list views — important once
 * the catalogue grows to hundreds of products.
 */
export interface ProductSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: Category;
  readonly featuredImage: string;
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  /** Lowest active-variant price, or null when nothing is purchasable. */
  readonly priceFrom: Money | null;
  readonly variantCount: number;
  readonly inStock: boolean;
  readonly createdAt: string;
}

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc" | "name-asc";

/** Filter / sort / paginate options for product listings. */
export interface ProductQuery {
  readonly categorySlug?: string;
  readonly featured?: boolean;
  readonly signature?: boolean;
  readonly search?: string;
  readonly sort?: ProductSort;
  readonly limit?: number;
  readonly offset?: number;
}

/** Generic paginated envelope so listings scale to large catalogues. */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
