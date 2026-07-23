import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Surface — the storefront's card language, in one place.
 *
 * Every card, panel and well is the same idea: a gold hairline over white with a
 * bright inner top edge, so the surface reads as packaging catching light rather
 * than as a filled box. Nothing else in the storefront should draw its own
 * border/shadow combination; if a surface needs to look different, it needs a
 * variant here.
 *
 * `interactive` adds the hover the product and category cards share — the line
 * warms and the surface lifts a hair. Deliberately not a shadow bloom: at this
 * weight, shadow reads as cheap.
 */

type SurfaceTone = "raised" | "flat" | "well";

const toneClasses: Record<SurfaceTone, string> = {
  /** Default: white, hairline, lit top edge. Product cards, panels, summaries. */
  raised: "bg-card border-[var(--hairline)] shadow-[var(--surface-inset)]",
  /** No fill — the page shows through. Ornamental mounts, quiet groupings. */
  flat: "bg-transparent border-[var(--hairline)]",
  /** Recessed: for inputs and anything that should read as containing something. */
  well: "bg-muted/40 border-border",
};

interface SurfaceProps {
  as?: ElementType;
  tone?: SurfaceTone;
  /** Adds the shared hover: hairline warms, surface lifts. */
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Surface({
  as: Tag = "div",
  tone = "raised",
  interactive = false,
  className,
  children,
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        "rounded-lg border",
        toneClasses[tone],
        interactive && [
          "transition-all duration-(--animate-duration-enter) ease-lux",
          "hover:border-[var(--hairline-hover)] hover:-translate-y-0.5",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        ],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
