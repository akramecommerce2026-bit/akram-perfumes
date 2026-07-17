import type { Metadata } from "next";

import { CollectionsGrid } from "@/components/collections/CollectionsGrid";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { productService } from "@/services/product-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections — Akram Perfumes",
  description:
    "Browse Akram Perfumes collections — attars, perfumes, incense and solid perfumes, each crafted for a distinct mood and occasion.",
};

export default async function CollectionsPage() {
  // Category artwork is authored in the admin, so nothing is curated here.
  const categories = await productService.getCategories();

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Explore"
          title="Collections"
          description="Discover fragrances grouped by craft and character — from oil-based attars to modern eaux de parfum."
        />

        {categories.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center text-muted-foreground">
            No collections available yet. Please check back soon.
          </p>
        ) : (
          <CollectionsGrid categories={categories} />
        )}
      </Container>
    </div>
  );
}
