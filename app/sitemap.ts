import type { MetadataRoute } from "next";

import { productService } from "@/services/product-service";

const SITE_URL = "https://akramperfumes.com";

// Refresh hourly so new products/collections appear without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listing, categories] = await Promise.all([
    productService.listProducts().catch(() => ({ items: [] as { slug: string }[] })),
    productService.getCategories().catch(() => [] as { slug: string }[]),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1, lastModified: now },
    ...["/shop", "/collections", "/new-arrivals", "/best-sellers", "/contact", "/track"].map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      lastModified: now,
    })),
  ];

  const productRoutes: MetadataRoute.Sitemap = listing.items.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: now,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/collections/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
    lastModified: now,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
