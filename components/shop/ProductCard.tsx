"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ProductBadge } from "@/components/shop/ProductBadge";
import { ProductPrice } from "@/components/shop/ProductPrice";
import { ProductVariant } from "@/components/shop/ProductVariant";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/product";

const MAX_VISIBLE_VARIANTS = 5;

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductCard({ product }: { product: ProductSummary }) {
  const href = `/shop/${product.slug}`;
  const isOnSale = Boolean(
    product.comparePriceFrom &&
      product.priceFrom &&
      product.comparePriceFrom.amount > product.priceFrom.amount,
  );
  const visibleVariants = product.variantNames.slice(0, MAX_VISIBLE_VARIANTS);
  const hiddenVariantCount = product.variantNames.length - visibleVariants.length;

  return (
    <motion.article
      variants={card}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-500 hover:border-accent/60 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={href} aria-label={`View ${product.name}`} className="block h-full w-full">
          <Image
            src={product.featuredImage}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isFeatured && <ProductBadge label="Featured" tone="featured" />}
          {isOnSale && <ProductBadge label="Sale" tone="sale" />}
          {!product.inStock && <ProductBadge label="Sold Out" tone="sold-out" />}
        </div>

        {/* Slide-up action panel on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-card/95 p-3 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none">
          <div className="flex gap-2">
            <Link
              href={href}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 rounded-full")}
            >
              View Product
            </Link>
            <Link
              href={href}
              className={cn(buttonVariants({ size: "sm" }), "flex-1 rounded-full hover:shadow-gold")}
            >
              Add to Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="text-[0.65rem] font-medium tracking-[0.15em] text-muted-foreground uppercase">
          {product.category.name}
        </span>

        <Link href={href}>
          <h3 className="font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-accent motion-reduce:transition-none">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>

        <div className="flex items-center gap-1.5 text-sm">
          <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>

        <ProductPrice price={product.priceFrom} comparePrice={product.comparePriceFrom} className="mt-1" />

        {visibleVariants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {visibleVariants.map((name) => (
              <ProductVariant key={name} name={name} />
            ))}
            {hiddenVariantCount > 0 && (
              <span className="inline-flex items-center text-xs text-muted-foreground">
                +{hiddenVariantCount}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
