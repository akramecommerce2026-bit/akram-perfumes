"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HeroSlideData } from "@/components/home/HeroSlide";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const primaryCta = cn(
  "inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-medium tracking-wide text-foreground shadow-md transition-all duration-300",
  "hover:bg-accent hover:text-accent-foreground hover:shadow-gold",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
);

const secondaryCta = cn(
  "inline-flex h-12 items-center justify-center rounded-full border border-background/50 px-8 text-sm font-medium tracking-wide text-background transition-all duration-300",
  "hover:border-accent hover:bg-background/10",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
);

export function HeroContent({ slide }: { slide: HeroSlideData }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-xl text-background"
    >
      <motion.span
        variants={item}
        className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-background uppercase backdrop-blur-sm"
      >
        <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
        {slide.badge}
      </motion.span>

      <motion.h1
        id="hero-heading"
        variants={item}
        className="mt-6 font-heading text-4xl leading-[1.06] font-semibold sm:text-5xl lg:text-6xl xl:text-7xl"
      >
        {slide.headlineLead}
        <span className="block italic text-accent">{slide.headlineAccent}</span>
      </motion.h1>

      <motion.p variants={item} className="mt-6 max-w-md text-base text-background/85 sm:text-lg">
        {slide.description}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
      >
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link href="/shop" className={cn(primaryCta, "w-full sm:w-auto")}>
            Shop Now
          </Link>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link href="/collections" className={cn(secondaryCta, "w-full sm:w-auto")}>
            Explore Collection
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
