"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { ProductBadge } from "@/components/shop/ProductBadge";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

/**
 * Product card.
 *
 * Anatomy follows the agreed reference: square (1:1) image with an 8px radius,
 * then rating · review count, title, then the price row (sale, struck original,
 * percent off), then a full-width uppercase Add to Cart. No card border or
 * shadow — the cards sit directly on the page and are separated by whitespace.
 *
 * Every value is derived from our own catalogue: `priceFrom`/`comparePriceFrom`
 * carry the existing pricing logic, and the discount is computed from them
 * rather than stored, so nothing here can drift from the backend.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const href = `/shop/${product.slug}`;

  const price = product.priceFrom;
  const comparePrice = product.comparePriceFrom;
  const isOnSale = Boolean(price && comparePrice && comparePrice.amount > price.amount);
  const percentOff =
    isOnSale && price && comparePrice
      ? Math.round(((comparePrice.amount - price.amount) / comparePrice.amount) * 100)
      : 0;

  return (
    /*
     * A single hairline of muted gold holds the card together. It is deliberately
     * near the threshold of visibility — enough to give the card an edge against
     * the ivory page, not enough to read as a box. Hover warms the same line and
     * lifts the card a hair; no glow, no shadow bloom.
     */
    <article className="group relative flex flex-col rounded-lg border border-accent/20 bg-card p-2.5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-accent/45 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
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
          {product.isFeatured && <ProductBadge label="Best Seller" tone="featured" />}
          {!product.inStock && <ProductBadge label="Sold Out" tone="sold-out" />}
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

        <Link href={href} className="mt-1.5">
          <h3 className="line-clamp-2 text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-accent-foreground motion-reduce:transition-none">
            {product.name}
          </h3>
        </Link>

        {price ? (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-base font-bold text-foreground">{formatMoney(price)}</span>
            {isOnSale && comparePrice && (
              <>
                <span className="text-[13px] text-muted-foreground line-through">
                  {formatMoney(comparePrice)}
                </span>
                <span className="text-[13px] font-semibold text-destructive">{percentOff}% off</span>
              </>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Unavailable</p>
        )}

        <Link
          href={href}
          className={cn(
            "mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-foreground/85 px-6",
            "text-[13px] font-bold tracking-wide text-foreground uppercase transition-colors duration-300",
            "hover:bg-foreground hover:text-background",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            !product.inStock && "pointer-events-none opacity-40",
          )}
        >
          {product.inStock ? "Add to Cart" : "Sold Out"}
        </Link>
      </div>
    </article>
  );
}
