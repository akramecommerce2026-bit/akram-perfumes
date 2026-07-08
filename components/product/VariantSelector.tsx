"use client";

import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/variant";

interface VariantSelectorProps {
  variants: readonly ProductVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
  className?: string;
}

/**
 * Reusable, controlled variant picker. Renders every active variant as a
 * selectable chip; out-of-stock variants are disabled. Works for any variant
 * type (volumes, roll-ons, bundles) since it only reads `variantName`.
 */
export function VariantSelector({
  variants,
  selectedId,
  onSelect,
  className,
}: VariantSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-sm font-semibold text-foreground">Select Option</span>
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select option">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isSoldOut = variant.stockQuantity <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isSoldOut}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "min-w-14 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isSelected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-accent hover:text-foreground",
                isSoldOut && "cursor-not-allowed text-muted-foreground/50 line-through hover:border-border hover:text-muted-foreground/50",
              )}
            >
              {variant.variantName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
