"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { TestimonialCard } from "@/components/home/TestimonialCard";
import type { Testimonial } from "@/types/testimonial";

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

// Matches the rail arrows in ProductSlider: gold hairline, fills on hover.
const arrowClass = cn(
  "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full",
  "border border-accent/40 text-foreground transition-colors duration-(--animate-duration-base) ease-lux",
  "hover:border-accent hover:bg-accent hover:text-accent-foreground",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex",
);

interface TestimonialsCarouselProps {
  testimonials: readonly Testimonial[];
  className?: string;
}

export function TestimonialsCarousel({
  testimonials,
  className,
}: TestimonialsCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = testimonials.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );
  const select = useCallback((n: number) => setIndex(n), []);

  useEffect(() => {
    if (paused || shouldReduceMotion || count <= 1) return;
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, shouldReduceMotion, count, next]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  }

  if (count === 0) return null;
  const active = testimonials[index];

  return (
    <div
      className={cn("relative mx-auto max-w-3xl", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        aria-label="Previous testimonial"
        onClick={prev}
        className={cn(arrowClass, "left-0 lg:-left-4")}
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next testimonial"
        onClick={next}
        className={cn(arrowClass, "right-0 lg:-right-4")}
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      {/*
          Keyed so React remounts on slide change and the CSS entrance replays —
          the crossfade without the risk. Under AnimatePresence the active card
          was server-rendered at opacity 0 and only became visible once framer
          hydrated, which meant no JS, no testimonials at all.
        */}
      <div className="mx-auto max-w-2xl">
        <div
          key={active.id}
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-(--animate-duration-enter) ease-lux"
        >
          <TestimonialCard testimonial={active} />
        </div>
      </div>

      <div
        className="mt-8 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Select testimonial"
      >
        {testimonials.map((testimonial, i) => (
          <button
            key={testimonial.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show testimonial ${i + 1}`}
            onClick={() => select(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              i === index
                ? "w-7 bg-accent"
                : "w-2.5 bg-foreground/20 hover:bg-foreground/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}
