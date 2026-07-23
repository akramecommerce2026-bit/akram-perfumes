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

  // The shadow is warm rather than neutral — a grey drop shadow on ivory reads
  // as dirt, where a gold-tinted one reads as depth. Two stops: a tight contact
  // shadow that seats the card, and a wide soft one that lifts it off the
  // lattice. Nothing about the card's own design changes.
  return (
    <Surface
      as="figure"
      className="flex flex-col items-center gap-6 px-6 py-10 text-center shadow-[0_2px_6px_oklch(0.55_0.05_75/0.05),0_18px_44px_-12px_oklch(0.55_0.06_75/0.14)] sm:px-12 sm:py-12"
    >
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
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Verified Buyer
            </span>
          )}
          {product && <span className="text-[13px] text-muted-foreground">Purchased &middot; {product}</span>}
        </div>
      </figcaption>
    </Surface>
  );
}
