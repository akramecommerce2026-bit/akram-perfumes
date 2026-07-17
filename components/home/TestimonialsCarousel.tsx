"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
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

export function TestimonialsCarousel({ testimonials, className }: TestimonialsCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = testimonials.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
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
    <MotionConfig reducedMotion="user">
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
        <button type="button" aria-label="Previous testimonial" onClick={prev} className={cn(arrowClass, "left-0 lg:-left-4")}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Next testimonial" onClick={next} className={cn(arrowClass, "right-0 lg:-right-4")}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>

        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <TestimonialCard testimonial={active} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Select testimonial">
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
                i === index ? "w-7 bg-accent" : "w-2.5 bg-foreground/20 hover:bg-foreground/40",
              )}
            />
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}
