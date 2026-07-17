import { Sparkles } from "lucide-react";

import { StarRating } from "@/components/common/star-rating";
import type { Product } from "@/types/product";

export function ProductInfo({ product }: { product: Product }) {
  const badgeLabel = product.isSignature
    ? "Signature Collection"
    : product.isFeatured
      ? "Featured"
      : product.category.name;

  return (
    <div className="flex flex-col gap-4">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-foreground uppercase">
        <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
        {badgeLabel}
      </span>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase">
          {product.category.name} &middot; {product.profile.concentration}
        </p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
          {product.name}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <StarRating rating={product.rating} />
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          {" · "}
          <a href="#reviews" className="underline-offset-4 hover:text-foreground hover:underline">
            {product.reviewCount} reviews
          </a>
        </span>
      </div>

      <p className="max-w-prose text-base text-muted-foreground">{product.shortDescription}</p>
    </div>
  );
}
