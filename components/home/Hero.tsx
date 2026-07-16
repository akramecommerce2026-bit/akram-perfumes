"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, useReducedMotion } from "framer-motion";

import { Container } from "@/components/common/container";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HeroContent } from "@/components/home/HeroContent";
import { HeroControls } from "@/components/home/HeroControls";
import { HeroPagination } from "@/components/home/HeroPagination";
import type { HeroSlideData } from "@/components/home/HeroSlide";

/**
 * Imagery only — the headline and CTAs are fixed across every slide, so the eye
 * stays on the copy while the scenery moves behind it. `alt` still varies: the
 * picture is what changes, and that is what a screen reader needs described.
 */
const slides: HeroSlideData[] = [
  {
    src: "/hero/slide-1-waterfall.webp",
    alt: "Akram eau de parfum on a mossy rock before a sunlit jungle waterfall",
  },
  {
    src: "/hero/slide-2-lagoon.webp",
    alt: "Akram eau de parfum on a stone island in a turquoise lagoon, framed by tropical flowers",
  },
  {
    src: "/hero/slide-3-bamboo.webp",
    alt: "Akram eau de parfum on a stream-washed rock in a sunlit bamboo grove",
  },
  {
    src: "/hero/slide-4-conservatory.webp",
    alt: "Akram eau de parfum on polished marble in a palm-filled Victorian conservatory",
  },
  {
    src: "/hero/slide-5-meadow.webp",
    alt: "Akram eau de parfum on a stone in an alpine wildflower meadow below a snow-capped peak",
  },
];

const AUTOPLAY_MS = 6000;
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

        {/*
          Readability scrims (constant, above imagery, below content). The
          product sits dead centre in every slide, so the weight is kept to the
          bottom and left — behind the copy — leaving the bottle itself clear.
        */}
        <div aria-hidden="true" className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--foreground)_88%,transparent),color-mix(in_oklab,var(--foreground)_45%,transparent)_32%,transparent_62%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_72%,transparent),color-mix(in_oklab,var(--foreground)_28%,transparent)_42%,transparent_68%)]" />
          {/*
            Portrait crops a 3:2 frame hard, which lifts the centred bottle right
            behind the copy — the left-hand scrim can't help when the text spans
            the full width. This deepens the lower half on small screens only, so
            the words stay legible without dulling the wide layouts.
          */}
          <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--foreground)_94%,transparent),color-mix(in_oklab,var(--foreground)_70%,transparent)_38%,transparent_72%)] sm:hidden" />
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--foreground)_32%,transparent),transparent)]" />
        </div>

        {/* Content — anchored bottom-left at every breakpoint so it never crosses
            the centred bottle. Bottom padding clears the pagination. */}
        <Container className="relative z-10 flex h-full items-end pb-28 sm:pb-32">
          <HeroContent />
        </Container>

        {/* Bottom bar: progress on the left under the copy, arrows on the right,
            clear of both the centred product and the headline. */}
        <div className="absolute inset-x-0 bottom-8 z-20">
          <Container className="flex items-center justify-between gap-4">
            <HeroPagination count={slides.length} index={index} onSelect={select} />
            <HeroControls onPrev={prev} onNext={next} />
          </Container>
        </div>
      </section>
    </MotionConfig>
  );
}
