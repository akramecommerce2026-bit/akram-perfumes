import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  starClassName?: string;
  className?: string;
}

/** Presentational 5-star rating. Reused across product info, cards and reviews. */
export function StarRating({ rating, starClassName = "size-4", className }: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-accent", className)}
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            starClassName,
            index < rounded ? "fill-current" : "fill-none text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}
