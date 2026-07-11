"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";

import { CollectionCard, type Collection } from "@/components/home/CollectionCard";

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/** Animated grid of collection cards, reused by the Collections page. */
export function CollectionsGrid({ collections }: { collections: readonly Collection[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
      >
        {collections.map((collection) => (
          <CollectionCard key={collection.href} {...collection} />
        ))}
      </motion.div>
    </MotionConfig>
  );
}
