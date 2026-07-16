import Link from "next/link";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductSlider } from "@/components/home/ProductSlider";
import { productService } from "@/services/product-service";

const RAIL_LIMIT = 10;

/**
 * Best sellers.
 *
 * Reads the catalogue through the same `best-selling` sort the /best-sellers
 * page uses, so the homepage rail and that page can never disagree about what is
 * selling. Server-rendered; nothing about the ranking lives in the frontend.
 */
export async function BestSellers() {
  const { items } = await productService.listProducts({
    sort: "best-selling",
    limit: RAIL_LIMIT,
  });
  if (items.length === 0) return null;

  return (
    <Section spacing="lg" className="bg-card">
      <SectionHeading
        eyebrow="Customer Favourites"
        title="Explore Our Best Sellers"
        subtitle="The fragrances our customers return to again and again."
      />

      <div className="mt-10">
        <ProductSlider products={items} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/best-sellers"
          className="inline-flex h-11 items-center justify-center rounded-md border border-foreground/85 px-8 text-[13px] font-bold tracking-wide text-foreground uppercase transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          View All
        </Link>
      </div>
    </Section>
  );
}
