"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface HeroSlideData {
  src: string;
  alt: string;
  badge: string;
  headlineLead: string;
  headlineAccent: string;
  description: string;
  /** object-position for cover cropping, defaults to center */
  focus?: string;
}

interface HeroSlideProps {
  slide: HeroSlideData;
  priority?: boolean;
}

/**
 * A single full-bleed slide: a cross-dissolving layer wrapping a slow
 * Ken Burns zoom on the image. Only the active slide is mounted (via the
 * parent AnimatePresence), so non-active images are never requested.
 */
export function HeroSlide({ slide, priority }: HeroSlideProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="absolute inset-0"
        initial={shouldReduceMotion ? undefined : { scale: 1.04 }}
        animate={shouldReduceMotion ? undefined : { scale: 1.13 }}
        transition={{ duration: 7, ease: "easeOut" }}
      >
        <Image
          src={slide.src}
          alt={slide.alt}
          fill
          priority={priority}
          sizes="100vw"
          quality={85}
          className="object-cover"
          style={{ objectPosition: slide.focus ?? "center" }}
        />
      </motion.div>
    </motion.div>
  );
}
