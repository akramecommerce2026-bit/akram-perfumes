import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — small status label.
 *
 * Supersedes ProductBadge, which was the same component scoped to one folder.
 * Squared off (rounded-sm) rather than a pill: the storefront's controls are
 * squared, and a pill here fought them.
 */
export const badge = cva(
  "inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase",
  {
    variants: {
      tone: {
        /** Gold. Merchandising: Best Seller, New. */
        accent: "bg-accent text-accent-foreground",
        /** Ink. Statements of fact about the product. */
        solid: "bg-foreground text-background",
        /** Withdrawn: out of stock, unavailable. */
        muted: "bg-muted text-muted-foreground",
        /** On imagery, where a fill would hide the picture. */
        overlay: "bg-background/85 text-foreground ring-1 ring-border backdrop-blur-sm",
        /** Price cuts only — the one place red earns its keep. */
        sale: "bg-destructive text-white",
      },
    },
    defaultVariants: { tone: "overlay" },
  },
);

interface BadgeProps extends VariantProps<typeof badge> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone, className, children }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)}>{children}</span>;
}
