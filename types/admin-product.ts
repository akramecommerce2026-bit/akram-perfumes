import type { Money } from "@/types/money";
import type { FragranceFamily, Gender } from "@/types/product-attributes";
import type { VariantStatus } from "@/types/variant";

export type ProductStatus = "active" | "draft";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Row shape for the admin products table. */
export interface AdminProductListItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly brand: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly featuredImage: string;
  /** SKU of the first variant (or null when the product has none). */
  readonly sku: string | null;
  /** Lowest active-variant price, or null. */
  readonly price: Money | null;
  readonly status: ProductStatus;
  readonly stockStatus: StockStatus;
  readonly totalStock: number;
  readonly variantCount: number;
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  readonly createdAt: string;
}

export interface AdminVariant {
  readonly id: string;
  readonly variantName: string;
  readonly price: Money;
  readonly comparePrice: Money | null;
  readonly sku: string;
  readonly stock: number;
  readonly lowStockThreshold: number;
  readonly status: VariantStatus;
  readonly displayOrder: number;
  /** This variant's own gallery, in display order. Empty when it has none. */
  readonly images: readonly AdminImage[];
}

export interface AdminImage {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly isPrimary: boolean;
  readonly displayOrder: number;
}

export interface AdminNotes {
  readonly top: readonly string[];
  readonly heart: readonly string[];
  readonly base: readonly string[];
}

/** Full editable product loaded into the edit form. */
export interface AdminProductDetail {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly categoryId: string;
  readonly brand: string;
  readonly gender: Gender;
  readonly concentration: string;
  readonly fragranceFamily: FragranceFamily;
  readonly isFeatured: boolean;
  readonly isSignature: boolean;
  readonly active: boolean;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly keywords: readonly string[];
  readonly ogImage: string;
  readonly featuredImage: string;
  readonly variants: readonly AdminVariant[];
  readonly notes: AdminNotes;
  readonly images: readonly AdminImage[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Query options for the admin products list. */
export interface AdminProductQuery {
  readonly search?: string;
  readonly categoryId?: string;
  readonly status?: ProductStatus | "all";
  readonly sort?: "newest" | "oldest";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AdminProductListResult {
  readonly items: readonly AdminProductListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
