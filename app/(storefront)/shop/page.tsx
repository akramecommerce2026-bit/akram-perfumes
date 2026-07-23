import { Suspense } from "react";
import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { ShopView } from "@/components/shop/ShopView";
import { productService } from "@/services/product-service";

// Incremental Static Regeneration: serve fast cached HTML, refreshed from
// Supabase every 5 minutes so catalogue edits (e.g. from a future Admin Panel)
// appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop — Akram Perfumes",
  description:
    "Explore the full Akram Perfumes collection — attars, perfumes, incense and solid perfumes, crafted for every personality and occasion.",
};

export default async function ShopPage() {
  const [listing, categories] = await Promise.all([
    productService.listProducts(),
    productService.getCategories(),
  ]);

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <header className="mb-8">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">The Collection</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Shop All Fragrances
          </h1>
          <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
            Explore attars, perfumes, incense and solid perfumes — crafted for every personality and
            every occasion.
          </p>
        </header>

        {/* ShopView reads ?collection= via useSearchParams, which needs a
            Suspense boundary for this page to stay statically rendered. */}
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          <ShopView products={listing.items} categories={categories} />
        </Suspense>
      </Container>
    </div>
  );
}
