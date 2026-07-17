import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
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
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Just In"
          title="New Arrivals"
          description="The newest fragrances to join the Akram collection — discover them first."
        />

        <ProductGrid products={items} />
      </Container>
    </div>
  );
}
