"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MotionConfig, motion, type Variants } from "framer-motion";

import { ProductCard } from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

const track: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const arrowClass = cn(
  "flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors",
  "hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
);

export function RelatedProducts({ products }: { products: readonly ProductSummary[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollBy(direction: number) {
    scrollerRef.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="related-heading" className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id="related-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
            You May Also Like
          </h2>
          <div className="hidden gap-2 md:flex">
            <button type="button" onClick={() => scrollBy(-1)} aria-label="Scroll left" className={arrowClass}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => scrollBy(1)} aria-label="Scroll right" className={arrowClass}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <motion.div
          ref={scrollerRef}
          variants={track}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="flex snap-x gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[74vw] max-w-[280px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </section>
    </MotionConfig>
  );
}
