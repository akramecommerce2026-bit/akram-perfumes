import type { Product, ProductSummary } from "@/types/product";

/**
 * Derive the listing shape from a full product.
 *
 * The wishlist and the product card both speak `ProductSummary`; the product
 * page holds a `Product`. This adapts one to the other so the PDP can use the
 * real wishlist control rather than a lookalike.
 *
 * It mirrors the service's own `toSummary`: price, MRP, discount and stock all
 * come from the default (first) variant — the one the product page opens on.
 * `Product.variants` is already the active, ordered set (the service filters
 * it), so `variants[0]` is that default — this is a shape adapter, not a second
 * opinion about the catalogue.
 */
export function toProductSummary(product: Product): ProductSummary {
  const defaultVariant = product.variants[0] ?? null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    shortDescription: product.shortDescription,
    featuredImage: product.featuredImage,
    rating: product.rating,
    reviewCount: product.reviewCount,
    fragranceFamily: product.fragranceFamily,
    gender: product.gender,
    occasions: product.occasions,
    isFeatured: product.isFeatured,
    isSignature: product.isSignature,
    priceFrom: defaultVariant?.price ?? null,
    comparePriceFrom: defaultVariant?.comparePrice ?? null,
    variantNames: product.variants.map((variant) => variant.variantName),
    variantCount: product.variants.length,
    inStock: (defaultVariant?.stockQuantity ?? 0) > 0,
    createdAt: product.createdAt,
  };
}
