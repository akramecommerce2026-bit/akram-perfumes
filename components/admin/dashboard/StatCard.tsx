"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Stagger index for the entrance animation. */
  index?: number;
  className?: string;
}

/** Reusable dashboard statistic card. Presentational — value is pre-formatted. */
export function StatCard({ label, value, icon: Icon, hint, index = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-accent">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-3xl font-semibold text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </motion.div>
  );
}
