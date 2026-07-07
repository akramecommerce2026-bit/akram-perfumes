"use client";

import { AnimatePresence } from "framer-motion";

import { HeroSlide, type HeroSlideData } from "@/components/home/HeroSlide";

interface HeroCarouselProps {
  slides: HeroSlideData[];
  index: number;
}

export function HeroCarousel({ slides, index }: HeroCarouselProps) {
  const slide = slides[index];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <HeroSlide key={slide.src} slide={slide} priority={index === 0} />
      </AnimatePresence>
    </div>
  );
}
