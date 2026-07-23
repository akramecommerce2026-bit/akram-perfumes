import Link from "next/link";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { ProductSlider } from "@/components/shop/ProductSlider";
import { productService } from "@/services/product-service";

const RAIL_LIMIT = 10;

/**
 * Signature Collection.
 *
 * The same shape as Best Sellers — Section, SectionHeading, ProductSlider — so
 * the two rails are one component structure with one card, differing only in
 * which slice of the catalogue they read. Best Sellers sorts by sales; this
 * filters on the product's `signature` flag.
 *
 * Entirely data-driven: membership is the `is_signature` column on `products`,
 * toggled per product in `/admin/products`. Adding or removing a product from
 * this rail is an admin action, never a code change. Nothing here is hardcoded
 * to any one product, and there is no CMS record behind the heading — the
 * section is the collection, not a featured item.
 *
 * Renders nothing rather than an empty rail when no products are flagged.
 */
export async function SignatureSection() {
  const items = await productService.getSignatureProducts(RAIL_LIMIT);
  if (items.length === 0) return null;

  return (
    <Section id="signature" spacing="lg">
      <SectionHeading
        eyebrow="The House of Akram"
        title="Signature Collection"
        subtitle="The fragrances that define the house."
      />

      <div className="mt-10">
        <ProductSlider products={items} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-md border border-foreground/85 px-8 text-[13px] font-bold tracking-wide text-foreground uppercase transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Shop
        </Link>
      </div>
    </Section>
  );
}
