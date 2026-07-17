import { SearchX } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductSummary } from "@/types/product";

/**
 * Product grid: 1 / 2 / 3 / 4 cards as the viewport grows.
 *
 * Four-up waits for `xl` because the Shop page spends 240px on the filter rail:
 * at 1024px that leaves 704px, so four cards would be 158px each — smaller than
 * a thumbnail. Three-up fills 1024–1279px at 221px a card, which is the same
 * card size four-up gets at 1280px. Without that step the tablet's two-up
 * stretched all the way to 1280 and rendered 342px cards — the "only two per
 * row, oversized" the shop was showing on a laptop.
 *
 * Gutters grow with the breakpoint so the rhythm stays even as cards widen.
 *
 * The staggered mount this had is gone: the card is no longer a motion component,
 * so the wrapper animated nothing and only cost the page a client bundle.
 */
export function ProductGrid({ products }: { products: readonly ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-lg font-semibold text-foreground">No fragrances found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or clearing a few filters to see more of the collection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 sm:gap-x-5 lg:grid-cols-3 lg:gap-y-14 xl:grid-cols-4 xl:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
