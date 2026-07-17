"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import { Price } from "@/components/common/price";
import { Surface } from "@/components/common/surface";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import type { ProductSummary } from "@/types/product";

/**
 * Product card.
 *
 * Anatomy: square (1:1) image, then rating · review count, title, the price row
 * (sale, struck original, percent off), and a full-width uppercase Add to Cart.
 *
 * The card stretches to its row (`h-full`) and floors the button with `mt-auto`,
 * so a row shares one button baseline no matter how the titles wrap.
 *
 * Every value is derived from our own catalogue: `priceFrom`/`comparePriceFrom`
 * carry the existing pricing logic, and the discount is computed from them
 * rather than stored, so nothing here can drift from the backend.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const href = `/shop/${product.slug}`;

  return (
    <Surface as="article" interactive className="group relative flex h-full flex-col p-2.5">
      <div className="relative overflow-hidden rounded-md bg-muted">
        <Link href={href} aria-label={`View ${product.name}`} className="block">
          {/* Fixed 1:1 box: the ratio is reserved before the image loads, so the
              grid never reflows as pictures arrive. */}
          <div className="relative aspect-square">
            <Image
              src={product.featuredImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {product.isFeatured && <Badge tone="accent">Best Seller</Badge>}
          {!product.inStock && <Badge tone="muted">Sold Out</Badge>}
        </div>

        <WishlistButton product={product} className="absolute top-2.5 right-2.5 z-10" />
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-[13px] leading-none">
            <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
            <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-muted-foreground/70" aria-hidden="true">
              |
            </span>
            <span className="text-muted-foreground">
              {product.reviewCount.toLocaleString("en-IN")}
            </span>
            <span className="sr-only">reviews</span>
          </div>
        )}

        {/* Two lines are reserved whether the title needs them or not, so a short
            name and a long one still put their price on the same line. */}
        <Link href={href} className="mt-1.5">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-accent-foreground motion-reduce:transition-none">
            {product.name}
          </h3>
        </Link>

        <Price
          price={product.priceFrom}
          comparePrice={product.comparePriceFrom}
          size="sm"
          className="mt-2 mb-3"
        />

        {/* mt-auto: the button sits on the card's floor, so a row of cards shares
            one button baseline however their titles wrap. */}
        <Button
          href={href}
          variant={product.inStock ? "gold" : "outline"}
          size="md"
          block
          aria-disabled={!product.inStock}
          className="mt-auto"
        >
          {product.inStock ? "Add to Cart" : "Sold Out"}
        </Button>
      </div>
    </Surface>
  );
}
