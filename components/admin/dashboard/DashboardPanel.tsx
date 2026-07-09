"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Card wrapper for dashboard sections — consistent header + framing. */
export function DashboardPanel({ title, description, action, className, children }: DashboardPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col rounded-2xl border border-border bg-card shadow-sm", className)}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex flex-col">
          <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </motion.section>
  );
}

/** Consistent empty state for placeholder sections with no data yet. */
export function DashboardEmpty({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
