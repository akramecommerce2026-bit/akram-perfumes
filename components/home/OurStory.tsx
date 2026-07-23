import Image from "next/image";
import type { CSSProperties } from "react";

import { Button } from "@/components/common/button";
import { Section } from "@/components/common/section";
import { paperTexture } from "@/components/common/section-paper";
import { OurStoryDunes } from "@/components/home/OurStoryDunes";
import { OurStoryLattice } from "@/components/home/OurStoryLattice";

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

/**
 * The compositional mask for the trellis.
 *
 * The aim is that no one can point to where the pattern starts. So there are no
 * tight hotspots and no hard falloff: every zone is a very large, very slow
 * gradient whose peak sits far off-canvas, and they overlap so the visible
 * field has an organic, non-radial shape you cannot trace. A faint full-field
 * floor keeps a trace of texture everywhere, so the pattern reads as part of
 * the paper rather than as ornaments that begin and end.
 *
 * Opaque (#000 alpha) shows the pattern; transparent hides it. The one place
 * held down is the middle, where the copy runs — but even there the floor keeps
 * a whisper, so nothing switches on or off.
 */
const STORY_MASK = [
  // Two large, gentle fields anchored above the top corners: the pattern
  // emerges from beyond the section and settles into clean paper by mid-height.
  // No constant floor — the lower half and the centre are meant to be silent,
  // and that emptiness is the point. The falloff is still long, so the fade is
  // smooth; it just resolves to nothing rather than to a whisper.
  "radial-gradient(105% 88% at 10% -46%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.34) 42%, transparent 82%)",
  "radial-gradient(105% 88% at 90% -46%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.34) 42%, transparent 82%)",
  // A soft breath of pattern rising up the right margin, well clear of the
  // logo, peak far off-canvas so it never spikes.
  "radial-gradient(64% 110% at 132% 26%, rgba(0,0,0,0.4) 0%, transparent 66%)",
].join(", ");

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
      // `isolate` makes this a stacking context, so the trellis's -z-10 sits
      // behind the copy instead of behind the section's own background.
      className="relative isolate overflow-hidden bg-[oklch(0.25_0.072_18)] text-foreground"
    >
      {/*
       * The quatrefoil trellis is the section's only decorative language. The
       * tile itself (OurStoryLattice) is a perfectly regular seamless repeat;
       * the *composition* lives here, as a mask built from a few radial zones —
       * strong in the top corners, medium at the right edge, soft in the lower
       * corners, and empty through the middle where the copy sits. One calm
       * field, framing the story rather than running under it.
       */}
      <div
        aria-hidden="true"
        style={{ maskImage: STORY_MASK, WebkitMaskImage: STORY_MASK }}
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.17]"
      >
        <OurStoryLattice className="absolute inset-0 h-full w-full" />
      </div>

      {/*
       * The lower artwork: layered flowing dunes only — no architecture. It
       * occupies the bottom band, full width, and dissolves upward into the
       * burgundy via its own mask; the wrapper holds it subtle enough that the
       * copy above stays the focus.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22%] opacity-[0.55]"
      >
        <OurStoryDunes className="absolute inset-0 h-full w-full" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-5 text-left">
          <span className={`${enter} text-[13px] font-medium tracking-[0.2em] text-accent uppercase`}>
            The House of Akram
          </span>

          <h2 className={`${enter} text-3xl font-bold text-foreground motion-safe:delay-75 sm:text-4xl`}>
            Our Story
          </h2>

          <div
            className={`${enter} flex max-w-xl flex-col gap-4 text-lg leading-relaxed text-muted-foreground motion-safe:delay-150`}
          >
            <p>
              Akram Perfumes began with a devotion to authentic oriental perfumery — the oud,
              amber and rare florals that have carried meaning across generations. We wanted to
              make those materials wearable today, without thinning what makes them worth wearing.
            </p>
            <p>
              Every fragrance is built from ingredients chosen one at a time, then blended, rested
              and revisited over weeks. Nothing is rushed to fill a shelf, and nothing leaves the
              house until it holds on skin the way it does on paper.
            </p>
            <p>
              What we are after is simple: timeless luxury worn lightly, elegance that never asks
              for attention, and a scent someone remembers long after you have left the room.
            </p>
          </div>

          <Button href="/shop" variant="gold" size="lg" className={`${enter} motion-safe:delay-200`}>
            Explore Our Collection
          </Button>
        </div>

        {/*
         * The mark fills the card edge to edge. The asset carries its own baked-in
         * cream ground (the ornate frame is part of the artwork), so it needs no
         * plate margin — the card is simply the window it shows through. The
         * square image fills the square card exactly, so `cover` neither crops nor
         * distorts; `overflow-hidden` clips the image's square corners to the
         * card's rounded ones, leaving no white gap on any side.
         */}
        <div className={`${enter} order-last flex justify-center motion-safe:delay-150 lg:justify-end`}>
          <div className="w-full max-w-[340px] overflow-hidden rounded-lg bg-card lg:max-w-[420px]">
            <div className="relative aspect-square w-full">
              <Image
                src="/brand/akram-logo.webp"
                alt="Akram Perfumes"
                fill
                sizes="(min-width: 1024px) 420px, 340px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
