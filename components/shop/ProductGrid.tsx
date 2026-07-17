import { SearchX } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductSummary } from "@/types/product";

/**
 * Product grid: one card on mobile, two on tablet, four once there is room.
 *
 * The four-up step waits for `xl` because the Shop page spends 260px of its
 * width on the filter rail — going four-up any earlier would squeeze the cards
 * below a comfortable reading size. Gutters grow with the breakpoint so the
 * rhythm stays even as the cards get wider.
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
    <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 sm:gap-x-5 lg:gap-y-14 xl:grid-cols-4 xl:gap-x-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
