"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The hero's copy is fixed for the whole carousel: it mounts once, plays its
 * entrance once, then stays perfectly still while the imagery changes behind it.
 * Nothing here is keyed to the slide index — re-animating the words on every
 * slide is what makes a carousel feel restless rather than calm.
 *
 * The entrance is a CSS animation, not a motion component. This is the page's
 * headline: it must end up visible even if hydration is slow or never happens,
 * and a declarative `animation` can't be left half-applied the way a JS-driven
 * variant can. Everything animated here is opacity/transform only, so the
 * entrance never shifts layout.
 */

const enter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700 motion-safe:fill-mode-both ease-[cubic-bezier(0.22,1,0.36,1)]";

const primaryCta = cn(
  "inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-medium tracking-wide text-foreground transition-all duration-300",
  "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
);

const secondaryCta = cn(
  "inline-flex h-12 items-center justify-center rounded-full border border-background/50 px-8 text-sm font-medium tracking-wide text-background transition-all duration-300",
  "hover:border-accent hover:bg-background/10 hover:-translate-y-0.5",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background",
);

export function HeroContent() {
  return (
    <div className="max-w-xl text-background">
      <span
        className={cn(
          enter,
          "inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-background uppercase backdrop-blur-sm",
        )}
      >
        <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
        Akram Perfumes
      </span>

      <h1
        id="hero-heading"
        className={cn(
          enter,
          "mt-6 text-4xl leading-[1.06] font-semibold sm:text-5xl lg:text-6xl motion-safe:delay-100",
        )}
      >
        Discover Your
        <span className="block italic text-accent">Signature Scent</span>
      </h1>

      <p
        className={cn(
          enter,
          "mt-5 max-w-md text-base text-background/85 sm:text-lg motion-safe:delay-200",
        )}
      >
        Crafted in Madurai from rare essences — fragrances composed to linger long after you leave
        the room.
      </p>

      <div
        className={cn(
          enter,
          "mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center motion-safe:delay-300",
        )}
      >
        <Link href="/shop" className={cn(primaryCta, "w-full sm:w-auto")}>
          Shop Now
        </Link>
        <Link href="/collections" className={cn(secondaryCta, "w-full sm:w-auto")}>
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
