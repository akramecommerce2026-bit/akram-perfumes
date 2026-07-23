import { ProductSlider } from "@/components/shop/ProductSlider";
import type { ProductSummary } from "@/types/product";

/**
 * Recommendations.
 *
 * Uses the same rail as Best Sellers rather than a second one: this was a
 * near-copy of it — scroll-snap track, arrow paging, hidden scrollbar — with its
 * own framer stagger on top, which also meant the cards mounted at opacity 0.
 * One rail, one behaviour, and the section is a Server Component now.
 */
export function RelatedProducts({ products }: { products: readonly ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-6">
      <h2 id="related-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
        You May Also Like
      </h2>
      <ProductSlider products={products} />
    </section>
  );
}
