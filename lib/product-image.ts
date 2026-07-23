/**
 * Resolving a product's display image — one source of truth.
 *
 * `products.featured_image` is a denormalised copy of whichever gallery image
 * is marked primary, written by the admin repository on save. That copy can be
 * empty: it is derived from the images array, and a product saved with no
 * images stores `""`. An empty string reaching `next/image` renders a broken
 * image, which is what this exists to prevent.
 *
 * So the featured column is treated as a cache, not as the truth. If it is
 * empty we fall back to the gallery, which is where the images actually live.
 * Both the read path and any future consumer should call this rather than
 * reading `featured_image` directly, so there is one definition of "this
 * product's image" instead of one per call site.
 *
 * Returns "" only when a product genuinely has no image anywhere — a data
 * problem that the admin form now prevents at the source (see
 * `lib/admin/product-schema.ts`, which requires at least one image).
 */
export function resolveProductImage(
  featuredImage: string | null | undefined,
  galleryImages: readonly string[] = [],
): string {
  const featured = featuredImage?.trim();
  if (featured) return featured;

  const fallback = galleryImages.find((url) => url?.trim());
  return fallback?.trim() ?? "";
}

/** True when a product has no usable image and cannot be rendered as a card. */
export function hasProductImage(
  featuredImage: string | null | undefined,
  galleryImages: readonly string[] = [],
): boolean {
  return resolveProductImage(featuredImage, galleryImages) !== "";
}
