"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useWishlist } from "@/components/wishlist/wishlist-context";

export function AccountWishlistCard() {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-accent/60"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="size-4 text-accent" aria-hidden="true" /> Wishlist
      </span>
      <span className="font-heading text-2xl font-semibold text-foreground">{count}</span>
      <span className="text-xs text-accent">View saved items →</span>
    </Link>
  );
}
