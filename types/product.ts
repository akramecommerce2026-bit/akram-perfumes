import type { Category } from "@/types/category";
import type { Money } from "@/types/money";
import type { FragranceFamily, Gender, Occasion, Season } from "@/types/product-attributes";
import type { ProductVariant } from "@/types/variant";

/** Scent pyramid — top / heart / base notes. */
export interface FragranceNotes {
  readonly top: readonly string[];
  readonly heart: readonly string[];
  readonly base: readonly string[];
}

/**
 * Performance / character attributes shown on the Product page. `longevity`
 * and `projection` are 1–5 scores; the rest map onto lookup columns later.
 */
export interface FragranceProfile {
  readonly concentration: string;
  readonly longevity: number;
  readonly projection: number;
  readonly seasons: readonly Season[];
}

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
  readonly shortDescription: string;
  readonly description: string;
  readonly featuredImage: string;
  readonly galleryImages: readonly string[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly fragranceFamily: FragranceFamily;
  readonly gender: Gender;
  readonly occasions: readonly Occasion[];
  readonly notes: FragranceNotes;
  readonly profile: FragranceProfile;
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
  readonly shortDescription: string;
  readonly description: string;
  readonly featuredImage: string;
  readonly galleryImages: readonly string[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly fragranceFamily: FragranceFamily;
  readonly gender: Gender;
  readonly occasions: readonly Occasion[];
  readonly notes: FragranceNotes;
  readonly profile: FragranceProfile;
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
  readonly shortDescription: string;
  readonly featuredImage: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly fragranceFamily: FragranceFamily;
  readonly gender: Gender;
  readonly occasions: readonly Occasion[];
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  /** Lowest active-variant price, or null when nothing is purchasable. */
  readonly priceFrom: Money | null;
  /** Compare-at price of the lowest-priced variant, when it is on sale. */
  readonly comparePriceFrom: Money | null;
  /** Active variant labels ("6ml", "Roll-On", ...) in display order. */
  readonly variantNames: readonly string[];
  readonly variantCount: number;
  readonly inStock: boolean;
  readonly createdAt: string;
}

export type ProductSort =
  | "featured"
  | "newest"
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "name-asc";

/**
 * Filter / sort / paginate options for product listings.
 *
 * Multi-value facets are arrays so the same shape serves both a Supabase query
 * (`in (...)`) and the client-side instant filtering used on the Shop page.
 */
export interface ProductQuery {
  readonly search?: string;
  readonly categorySlug?: string;
  readonly genders?: readonly Gender[];
  readonly fragranceFamilies?: readonly FragranceFamily[];
  readonly occasions?: readonly Occasion[];
  /** Inclusive price bounds in minor currency units (paise). */
  readonly priceMin?: number;
  readonly priceMax?: number;
  readonly inStockOnly?: boolean;
  readonly featured?: boolean;
  readonly signature?: boolean;
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
