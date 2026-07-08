import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { ShopView } from "@/components/shop/ShopView";
import { productService } from "@/services/product-service";

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
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">The Collection</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Shop All Fragrances
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Explore attars, perfumes, incense and solid perfumes — crafted for every personality and
            every occasion.
          </p>
        </header>

        <ShopView products={listing.items} categories={categories} />
      </Container>
    </div>
  );
}
