"use client";

import { MotionConfig, motion } from "framer-motion";

import type { Product } from "@/types/product";

export function ProductDescription({ product }: { product: Product }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center"
      >
        <span className="text-xs font-medium tracking-[0.2em] text-accent uppercase">The Experience</span>
        <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          The Art of {product.name}
        </h2>
        <span aria-hidden="true" className="h-px w-16 bg-accent/50" />
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {product.description}
        </p>
      </motion.section>
    </MotionConfig>
  );
}
