"use client";

import { Heart } from "lucide-react";

import { useWishlist } from "@/components/wishlist/wishlist-context";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

/** Heart toggle used on product cards + the product detail page. */
export function WishlistButton({
  product,
  className,
  size = "sm",
}: {
  product: ProductSummary;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { has, toggle } = useWishlist();
  const active = has(product.id);

  return (
    <button
      type="button"
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(product);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        size === "sm" ? "size-9" : "size-11",
        active && "text-accent",
        className,
      )}
    >
      <Heart className={cn(size === "sm" ? "size-4" : "size-5", active && "fill-accent")} aria-hidden="true" />
    </button>
  );
}
