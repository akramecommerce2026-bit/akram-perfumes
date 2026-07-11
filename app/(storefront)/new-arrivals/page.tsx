import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { productService } from "@/services/product-service";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "New Arrivals — Akram Perfumes",
  description: "The latest additions to the Akram Perfumes collection — freshly crafted fragrances.",
};

export default async function NewArrivalsPage() {
  const { items } = await productService.listProducts({ sort: "newest" });

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Just In</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            New Arrivals
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            The newest fragrances to join the Akram collection — discover them first.
          </p>
        </header>

        <ProductGrid products={items} />
      </Container>
    </div>
  );
}
