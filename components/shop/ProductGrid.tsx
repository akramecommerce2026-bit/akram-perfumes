"use client";

import { motion, type Variants } from "framer-motion";
import { SearchX } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductSummary } from "@/types/product";

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export function ProductGrid({ products }: { products: readonly ProductSummary[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-heading text-lg text-foreground">No fragrances found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or clearing a few filters to see more of the collection.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      // Re-run the stagger whenever the result set changes (filter/sort/page).
      key={products.map((product) => product.id).join("-")}
      variants={grid}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  );
}
