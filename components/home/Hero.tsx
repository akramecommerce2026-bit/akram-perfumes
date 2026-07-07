"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";

import { Container } from "@/components/common/container";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HeroContent } from "@/components/home/HeroContent";
import { HeroControls } from "@/components/home/HeroControls";
import { HeroPagination } from "@/components/home/HeroPagination";
import type { HeroSlideData } from "@/components/home/HeroSlide";

const slides: HeroSlideData[] = [
  {
    src: "/hero/slide-1.webp",
    alt: "Akram eau de parfum on green marble beneath a glass arch",
    badge: "Timeless Elegance",
    headlineLead: "Luxury, Crafted for",
    headlineAccent: "Every Occasion",
    description:
      "A refined composition of rare essences, poured into glass and gold for those who wear distinction effortlessly.",
  },
  {
    src: "/hero/slide-2.webp",
    alt: "Akram eau de parfum amid lush tropical greenery and dark orchids",
    badge: "The Maison Collection",
    headlineLead: "Experience the Art of",
    headlineAccent: "Fine Fragrance",
    description:
      "Where precious oud, orchid and warm amber entwine — a scent composed with the patience of a masterpiece.",
  },
  {
    src: "/hero/slide-3.webp",
    alt: "Akram Al Oudh eau de parfum on emerald marble with gold detailing",
    badge: "Your Signature",
    headlineLead: "Discover Your",
    headlineAccent: "Signature Scent",
    description:
      "Luminous, bold and unforgettable — find the fragrance that lingers long after you leave the room.",
  },
];

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), []);
  const select = useCallback((n: number) => setIndex(n), []);

  useEffect(() => {
    if (paused || shouldReduceMotion) return;
    const id = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, shouldReduceMotion, next]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  }

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

  const active = slides[index];

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-roledescription="carousel"
        aria-label="Featured fragrances"
        aria-labelledby="hero-heading"
        className="relative h-[calc(100svh-6.25rem)] min-h-[560px] w-full overflow-hidden bg-foreground md:h-[calc(100svh-7.25rem)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <HeroCarousel slides={slides} index={index} />

        {/* Readability scrims (constant, above imagery, below content) */}
        <div aria-hidden="true" className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_82%,transparent),color-mix(in_oklab,var(--foreground)_38%,transparent)_38%,transparent_66%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--foreground)_80%,transparent),transparent_46%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_32%,transparent),transparent)]" />
        </div>

        {/* Content */}
        <Container className="relative z-10 flex h-full items-end pb-32 sm:items-center sm:pb-16">
          <HeroContent key={index} slide={active} />
        </Container>

        <HeroControls onPrev={prev} onNext={next} />

        {/* Pagination */}
        <div className="absolute inset-x-0 bottom-8 z-20">
          <Container>
            <HeroPagination count={slides.length} index={index} onSelect={select} />
          </Container>
        </div>
      </section>
    </MotionConfig>
  );
}
