"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { ProductGrid } from "@/components/shop/ProductGrid";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWishlist } from "@/components/wishlist/wishlist-context";
import { cn } from "@/lib/utils";

export function WishlistView() {
  const { items, count, clear } = useWishlist();

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Heart className="size-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-foreground">Your wishlist is empty</h2>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any fragrance to save it here for later.
          </p>
        </div>
        <Link href="/shop" className={cn(buttonVariants(), "h-11 rounded-full px-6")}>
          Explore the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? "item" : "items"} saved
        </p>
        <Button type="button" variant="outline" size="sm" onClick={clear} className="rounded-full">
          Clear all
        </Button>
      </div>
      <ProductGrid products={items} />
    </div>
  );
}
