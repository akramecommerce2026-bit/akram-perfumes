import Image from "next/image";
import type { CSSProperties } from "react";

import { Button } from "@/components/common/button";
import { Section } from "@/components/common/section";
import { paperTexture } from "@/components/common/section-paper";

/*
 * Our Story runs the footer's dark colour context, so the page resolves from
 * ivory into burgundy here and stays there through the footer — the transition
 * reads as intentional rather than as one odd dark band.
 *
 * The palette is lifted from components/layout/footer.tsx verbatim rather than
 * re-picked, so the two can never drift. As there, the theme variables are
 * overridden on the element itself: local inline style, no global CSS and no
 * token definitions touched. Every inherited `text-foreground` /
 * `text-muted-foreground` / `border-border` resolves light here and nowhere
 * else. Gold `--accent` is left alone; it was chosen to read on both grounds.
 */
const storyTheme = {
  "--foreground": "oklch(0.97 0.012 85)",
  "--muted-foreground": "oklch(0.82 0.022 82)",
  "--border": "oklch(1 0 0 / 0.16)",
  // The burgundy swallows noise, so it carries roughly double the ivory's
  // strength to land at the same apparent weight.
  backgroundImage: paperTexture(0.03),
} as CSSProperties;

/** Matches SectionHeading's entrance exactly, so this section arrives like the rest. */
const enter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both";

/**
 * Our Story — the brand note between the catalogue and the testimonials.
 *
 * A Server Component: the copy is static and must never wait on JS to appear.
 */
export function OurStory() {
  return (
    <Section
      spacing="lg"
      style={storyTheme}
      className="relative overflow-hidden bg-[oklch(0.25_0.072_18)] text-foreground"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-5 text-left">
          <span className={`${enter} text-[13px] font-medium tracking-[0.2em] text-accent uppercase`}>
            The House of Akram
          </span>

          <h2 className={`${enter} text-2xl font-bold text-foreground motion-safe:delay-75 sm:text-3xl`}>
            Our Story
          </h2>

          <div
            className={`${enter} flex max-w-xl flex-col gap-4 text-base leading-relaxed text-muted-foreground motion-safe:delay-150`}
          >
            <p>
              Akram Perfumes began with a devotion to authentic oriental perfumery — the oud,
              amber and florals that have carried meaning for centuries.
            </p>
            <p>
              Every fragrance is built from ingredients chosen one at a time, then aged and
              balanced by hand until it earns its place in the house.
            </p>
            <p>
              What we are after is simple: timeless luxury, quiet elegance, and a scent someone
              remembers long after you have left the room.
            </p>
          </div>

          <Button href="/shop" variant="gold" size="lg" className={`${enter} motion-safe:delay-200`}>
            Explore Our Collection
          </Button>
        </div>

        {/*
         * The mark sits on a light plate rather than directly on the burgundy,
         * for two reasons. Its own colours are deep green and gold, and green on
         * burgundy is close to unreadable. More concretely, the asset is a JPEG
         * with a baked-in white matte, not a transparent PNG — dropped straight
         * onto the burgundy it would show as a hard white rectangle. The plate
         * is the same white as that matte, so the edge disappears and the mark
         * reads as a framed piece on the ground it was drawn for.
         *
         * Replace the plate only if the logo is re-cut with transparency.
         * `contain` preserves the source's aspect ratio; this one is square.
         */}
        <div className={`${enter} order-last flex justify-center motion-safe:delay-150 lg:justify-end`}>
          <div className="w-full max-w-[340px] rounded-lg bg-card p-10 lg:max-w-[420px] lg:p-14">
            <div className="relative aspect-square w-full">
              <Image
                src="/brand/akram-logo.jpg"
                alt="Akram Perfumes"
                fill
                sizes="(min-width: 1024px) 420px, 340px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
