import type { Metadata } from "next";

import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { Container } from "@/components/common/container";
import type { Collection } from "@/components/home/CollectionCard";
import { productService } from "@/services/product-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections — Akram Perfumes",
  description:
    "Browse Akram Perfumes collections — attars, perfumes, incense and solid perfumes, each crafted for a distinct mood and occasion.",
};

/** Curated hero images for the seed categories; falls back to a product image. */
const CURATED_IMAGE: Record<string, string> = {
  attars: "/collections/attars.webp",
  perfumes: "/collections/perfumes.webp",
  incense: "/collections/incense.webp",
  "solid-perfumes": "/collections/solid-perfumes.webp",
};

export default async function CollectionsPage() {
  const [categories, listing] = await Promise.all([
    productService.getCategories(),
    productService.listProducts(),
  ]);

  const collections: Collection[] = categories.map((category) => {
    const inCategory = listing.items.filter((product) => product.category.slug === category.slug);
    const count = inCategory.length;
    const image =
      CURATED_IMAGE[category.slug] ?? inCategory[0]?.featuredImage ?? "/collections/perfumes.webp";
    return {
      title: category.name,
      description:
        category.description ??
        `${count} ${count === 1 ? "fragrance" : "fragrances"} in this collection.`,
      href: `/collections/${category.slug}`,
      image,
    };
  });

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Explore</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Collections
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Discover fragrances grouped by craft and character — from oil-based attars to modern
            eaux de parfum.
          </p>
        </header>

        {collections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center text-muted-foreground">
            No collections available yet. Please check back soon.
          </p>
        ) : (
          <CollectionsGrid collections={collections} />
        )}
      </Container>
    </div>
  );
}
