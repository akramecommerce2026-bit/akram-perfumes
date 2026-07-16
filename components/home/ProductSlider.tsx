"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductSummary } from "@/types/product";

/**
 * Horizontal product rail.
 *
 * Native scroll-snap rather than a carousel library: it gives real momentum and
 * swipe on touch for free, keeps the keyboard and scrollbar semantics browsers
 * already provide, and ships no JS for the scrolling itself. The arrows simply
 * page it by one viewport, and are hidden where swipe is the natural gesture.
 */
export function ProductSlider({ products }: { products: readonly ProductSummary[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const page = useCallback((direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.9, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      {/* Bleeds to the gutter so a card is always half-visible at the edge —
          the rail reads as continuing rather than ending. */}
      <div
        ref={railRef}
        className="-mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-gutter pb-1 sm:gap-5 xl:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="w-[68%] shrink-0 snap-start sm:w-[44%] lg:w-[30%] xl:w-[23%]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-8 hidden items-center justify-center gap-3 md:flex">
        <RailButton label="Previous products" onClick={() => page(-1)}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </RailButton>
        <RailButton label="More products" onClick={() => page(1)}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </RailButton>
      </div>
    </div>
  );
}

function RailButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-accent/40 text-foreground transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </button>
  );
}
