import type { Product, ProductSummary } from "@/types/product";

/**
 * Derive the listing shape from a full product.
 *
 * The wishlist and the product card both speak `ProductSummary`; the product
 * page holds a `Product`. This adapts one to the other so the PDP can use the
 * real wishlist control rather than a lookalike.
 *
 * It mirrors the service's own `toSummary`: price comes from the cheapest
 * variant and stock is "any variant has some". `Product.variants` is already the
 * active, ordered set (the service filters it), so no further filtering is done
 * here — this is a shape adapter, not a second opinion about the catalogue.
 */
export function toProductSummary(product: Product): ProductSummary {
  const cheapest = product.variants.reduce<Product["variants"][number] | null>(
    (lowest, variant) => (!lowest || variant.price.amount < lowest.price.amount ? variant : lowest),
    null,
  );

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
    priceFrom: cheapest?.price ?? null,
    comparePriceFrom: cheapest?.comparePrice ?? null,
    variantNames: product.variants.map((variant) => variant.variantName),
    variantCount: product.variants.length,
    inStock: product.variants.some((variant) => variant.stockQuantity > 0),
    createdAt: product.createdAt,
  };
}
