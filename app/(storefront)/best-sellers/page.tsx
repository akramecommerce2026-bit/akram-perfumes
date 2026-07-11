import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { productService } from "@/services/product-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Best Sellers — Akram Perfumes",
  description: "The most-loved Akram Perfumes fragrances, ranked by customer favourites.",
};

export default async function BestSellersPage() {
  const { items } = await productService.listProducts({ sort: "best-selling" });

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Customer Favourites</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Best Sellers
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Our most-loved fragrances — the ones our customers return to again and again.
          </p>
        </header>

        <ProductGrid products={items} />
      </Container>
    </div>
  );
}
