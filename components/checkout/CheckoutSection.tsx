"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface CheckoutSectionProps {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Numbered, card-framed section used down the checkout's left column. */
export function CheckoutSection({ step, title, description, children }: CheckoutSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: step * 0.06 }}
      className="rounded-lg border border-border bg-card p-6 sm:p-7"
    >
      <header className="mb-5 flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-sm font-semibold text-accent-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </header>
      {children}
    </motion.section>
  );
}
