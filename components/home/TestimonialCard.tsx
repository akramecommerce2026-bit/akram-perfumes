import { BadgeCheck, Quote } from "lucide-react";

import { StarRating } from "@/components/common/star-rating";
import { Surface } from "@/components/common/surface";
import type { Testimonial } from "@/types/testimonial";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { name, rating, verified, product, review } = testimonial;

  return (
    <Surface as="figure" className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-12 sm:py-12">
      <Quote className="size-8 text-accent/60" aria-hidden="true" />

      <StarRating rating={rating} />

      <blockquote className="max-w-xl text-lg leading-relaxed text-foreground sm:text-xl">
        &ldquo;{review}&rdquo;
      </blockquote>

      <figcaption className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_28%,var(--card)),var(--card))] text-base font-semibold text-foreground ring-1 ring-accent/30"
        >
          {getInitials(name)}
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="font-medium text-foreground">{name}</span>
          {verified && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Verified Buyer
            </span>
          )}
          {product && <span className="text-xs text-muted-foreground">Purchased &middot; {product}</span>}
        </div>
      </figcaption>
    </Surface>
  );
}
