"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * A hero slide is imagery only. The headline and CTAs are fixed across the whole
 * carousel (see HeroContent), so nothing here carries copy — only the picture
 * and the alt text describing it.
 */
export interface HeroSlideData {
  src: string;
  alt: string;
  /** object-position for cover cropping, defaults to center */
  focus?: string;
}

interface HeroSlideProps {
  slide: HeroSlideData;
  /** The slide currently on show. Inactive slides stay mounted but transparent. */
  active: boolean;
  priority?: boolean;
}

/**
 * One full-bleed slide that cross-dissolves on `active` and drifts slowly while
 * it shows.
 *
 * The fade is a plain CSS transition rather than a motion component: a slide
 * lives across many active/inactive flips, and driving opacity declaratively
 * from a prop is something the compositor does for free and cannot get stuck
 * half-applied. Both layers animate only opacity and transform, so no slide
 * change ever triggers layout.
 */
export function HeroSlide({ slide, active, priority }: HeroSlideProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden={!active}
      className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
      style={{ opacity: active ? 1 : 0 }}
    >
      {/*
        A restrained drift. These are wide scenic compositions (3:2) shown in a
        wider frame, so `cover` already crops top and bottom — a large zoom on
        top of that pushes the scenery out of shot and leaves only the bottle.
        Small enough to read as a slow breath rather than a move.
      */}
      <div
        className="absolute inset-0 ease-out will-change-transform motion-reduce:transition-none"
        style={
          shouldReduceMotion
            ? undefined
            : {
                transform: `scale(${active ? 1.045 : 1.005})`,
                transitionProperty: "transform",
                transitionDuration: active ? "9s" : "1s",
              }
        }
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
      </div>
    </div>
  );
}
