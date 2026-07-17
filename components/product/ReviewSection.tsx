"use client";

import { BadgeCheck } from "lucide-react";
import { MotionConfig, motion, type Variants } from "framer-motion";

import { StarRating } from "@/components/common/star-rating";
import type { Review } from "@/types/review";

interface ReviewSectionProps {
  reviews: readonly Review[];
  rating: number;
  reviewCount: number;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function ReviewSection({ reviews, rating, reviewCount }: ReviewSectionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <section id="reviews" aria-labelledby="reviews-heading" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 id="reviews-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-foreground">{rating.toFixed(1)}</span>
              <div className="flex flex-col">
                <StarRating rating={rating} />
                <span className="text-sm text-muted-foreground">Based on {reviewCount} reviews</span>
              </div>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            No written reviews yet — be the first to share your experience.
          </p>
        ) : (
          <motion.ul
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-5 md:grid-cols-2"
          >
            {reviews.map((review) => (
              <motion.li
                key={review.id}
                variants={item}
                className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      {review.name}
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                          <BadgeCheck className="size-3.5" aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </span>
                    <StarRating rating={review.rating} starClassName="size-3.5" />
                  </div>
                  <time
                    dateTime={review.createdAt}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {dateFormatter.format(new Date(review.createdAt))}
                  </time>
                </div>
                {review.title && <p className="font-medium text-foreground">{review.title}</p>}
                <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </section>
    </MotionConfig>
  );
}
