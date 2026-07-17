import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
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
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Customer Favourites"
          title="Best Sellers"
          description="Our most-loved fragrances — the ones our customers return to again and again."
        />

        <ProductGrid products={items} />
      </Container>
    </div>
  );
}
