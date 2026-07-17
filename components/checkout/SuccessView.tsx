"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Mail, Package } from "lucide-react";

import { storefrontButton } from "@/components/common/button";
import { cn } from "@/lib/utils";

interface SuccessViewProps {
  orderNumber: string;
}

/** Premium order-confirmation content with an animated success mark. */
export function SuccessView({ orderNumber }: SuccessViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex max-w-lg flex-col items-center gap-8 py-section-sm text-center"
    >
      <div className="relative flex size-24 items-center justify-center">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-0 rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
        />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground"
        >
          <Check className="size-8" strokeWidth={2.5} aria-hidden="true" />
        </motion.span>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Order Confirmed</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Thank you for your order
        </h1>
        <p className="text-muted-foreground">
          We&rsquo;ve received your order and are preparing it with care. A confirmation has been sent
          to your email.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Package className="size-4 text-accent" aria-hidden="true" />
          Order Number
        </div>
        <p className="text-2xl font-semibold tracking-wide text-foreground">
          {orderNumber}
        </p>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5" aria-hidden="true" />
          Keep this number for tracking &amp; support.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shop"
          className={cn(storefrontButton({ variant: "primary", size: "lg", block: false }))}
        >
          Continue Shopping
        </Link>
        <Link
          href={`/track/${encodeURIComponent(orderNumber)}`}
          className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Track Order
        </Link>
      </div>
    </motion.div>
  );
}
