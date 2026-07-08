import { cn } from "@/lib/utils";

interface ProductVariantProps {
  /** Variant label, e.g. "6ml", "Roll-On", "40 Sticks". */
  name: string;
  className?: string;
}

/**
 * A single variant chip used to preview available options on a product card.
 * Kept presentational so the product page can reuse it as a selectable control.
 */
export function ProductVariant({ name, className }: ProductVariantProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      {name}
    </span>
  );
}
