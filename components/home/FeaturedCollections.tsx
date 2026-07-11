"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";

import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { CollectionCard, type Collection } from "@/components/home/CollectionCard";

const collections: Collection[] = [
  {
    title: "Attars",
    description: "Pure oil-based fragrances with depth that lingers.",
    href: "/collections/attars",
    image: "/collections/attars.webp",
  },
  {
    title: "Perfumes",
    description: "Signature eaux de parfum for every occasion.",
    href: "/collections/perfumes",
    image: "/collections/perfumes.webp",
  },
  {
    title: "Incense",
    description: "Bakhoor and oud to perfume your every space.",
    href: "/collections/incense",
    image: "/collections/incense.webp",
  },
  {
    title: "Solid Perfumes",
    description: "Travel-ready balms crafted for life in motion.",
    href: "/collections/solid-perfumes",
    image: "/collections/solid-perfumes.webp",
  },
];

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export function FeaturedCollections() {
  return (
    <MotionConfig reducedMotion="user">
      <Section spacing="lg">
        <SectionHeading
          eyebrow="Curated Selection"
          title="Featured Collections"
          subtitle="Explore fragrances crafted for every personality and every occasion."
        />

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8"
        >
          {collections.map((collection) => (
            <CollectionCard key={collection.href} {...collection} />
          ))}
        </motion.div>
      </Section>
    </MotionConfig>
  );
}
