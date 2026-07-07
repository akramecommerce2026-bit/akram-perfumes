"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignatureFeatures } from "@/components/home/SignatureFeatures";

const intro: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function SignatureContent() {
  return (
    <div className="flex flex-col gap-10">
      <motion.div
        variants={intro}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="flex flex-col items-start gap-6"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-foreground uppercase"
        >
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          Signature Collection
        </motion.span>

        <motion.h2
          variants={item}
          className="font-heading text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl"
        >
          Bin Sheikh
        </motion.h2>

        <motion.p variants={item} className="max-w-md text-base text-muted-foreground sm:text-lg">
          A masterpiece crafted with rich oriental notes, refined elegance, and exceptional
          longevity.
        </motion.p>
      </motion.div>

      <SignatureFeatures />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Link
          href="/shop/perfumes"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 rounded-full px-8 text-sm tracking-wide shadow-md transition-shadow duration-300 hover:shadow-gold",
          )}
        >
          Shop Bin Sheikh
        </Link>
        <Link
          href="/collections"
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "h-12 rounded-full border-foreground/20 px-8 text-sm tracking-wide transition-colors duration-300 hover:border-accent hover:bg-accent/10",
          )}
        >
          Learn More
        </Link>
      </motion.div>
    </div>
  );
}
