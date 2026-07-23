"use client";

import { HeroSlide, type HeroSlideData } from "@/components/home/HeroSlide";

interface HeroCarouselProps {
  slides: HeroSlideData[];
  index: number;
}

/**
 * Renders a three-slide window — outgoing, active, incoming — and nothing else.
 *
 * Mounting is deliberate rather than delegated to AnimatePresence, which faded
 * exited slides to `opacity: 0` but never unmounted them: every slide the
 * carousel had ever shown stayed stacked in the DOM, so all five images ended up
 * downloaded and composited.
 *
 * The window does the preloading for free. The incoming slide is already mounted
 * and decoded (sitting at opacity 0) before it is ever shown, so the dissolve
 * reveals a finished picture instead of a blank frame. The outgoing slide stays
 * mounted only while it fades, then drops out once it is already invisible.
 */
export function HeroCarousel({ slides, index }: HeroCarouselProps) {
  const previous = (index - 1 + slides.length) % slides.length;
  const next = (index + 1) % slides.length;
  const mounted = [...new Set([previous, index, next])].sort((a, b) => a - b);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {mounted.map((position) => (
        <HeroSlide
          key={slides[position].src}
          slide={slides[position]}
          active={position === index}
          // Only the very first slide is LCP; the rest arrive ahead of time via
          // the window, so they never need to jump the queue.
          priority={position === 0}
        />
      ))}
    </div>
  );
}
