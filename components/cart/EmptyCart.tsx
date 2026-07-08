"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyCartProps {
  /** Fires when the user chooses to continue shopping (e.g. close the drawer). */
  onContinue?: () => void;
  className?: string;
}

export function EmptyCart({ onContinue, className }: EmptyCartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col items-center justify-center gap-6 text-center", className)}
    >
      <span
        aria-hidden="true"
        className="flex size-24 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-accent"
      >
        <ShoppingBag className="size-10" strokeWidth={1.5} />
      </span>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold text-foreground">Your cart is empty</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Discover our signature fragrances and add your favourites to begin.
        </p>
      </div>

      <Link
        href="/shop"
        onClick={onContinue}
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Continue Shopping
      </Link>
    </motion.div>
  );
}
