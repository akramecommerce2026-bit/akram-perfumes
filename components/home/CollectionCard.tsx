"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export interface Collection {
  title: string;
  description: string;
  href: string;
  image: string;
}

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function CollectionCard({ title, description, href, image }: Collection) {
  return (
    <motion.div
      variants={card}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <Link
        href={href}
        aria-label={`Explore ${title}`}
        className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl border border-border/60 shadow-md transition-shadow duration-500 hover:border-accent/60 hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Image
          src={image}
          alt={`Akram ${title} collection`}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        {/* Soft dark gradient overlay for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--foreground)_88%,transparent),color-mix(in_oklab,var(--foreground)_22%,transparent)_46%,transparent_74%)]"
        />

        <div className="relative z-10 flex flex-col gap-2 p-6 text-background">
          <h3 className="font-heading text-2xl font-semibold transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none">
            {title}
          </h3>
          <p className="text-sm text-background/80">{description}</p>
          <span className="mt-2 inline-flex translate-y-2 items-center gap-1.5 text-sm font-medium tracking-wide text-accent opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none">
            Explore Collection
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
