import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The homepage's background architecture, in one place.
 *
 * Each section gets a different elevation of the same imagined building —
 * arcades, colonnades, layered panels, vaulting — so no two backgrounds repeat
 * while all four read as one place. Original geometry throughout: the forms are
 * generated from the helpers below rather than traced from anything.
 *
 * Three rules keep it background rather than decoration:
 *
 *   1. Everything is oversized and starts outside the viewBox on at least one
 *      side, so the composition is always cropped and never resolves.
 *   2. Openings are knocked out with `evenodd` rather than painted in the page
 *      colour, so the artwork stays correct on ivory and on burgundy alike.
 *   3. One flat fill at 5% — no stroke, gradient, blur, shadow or glow.
 *
 * The wrapper is `aria-hidden`, pointer-transparent and out of layout flow, so
 * it cannot shift content, take a click, or reach assistive tech. Host sections
 * need `relative overflow-hidden`.
 */

/**
 * A pointed arch: jambs rising to a springing line, then two quadratics meeting
 * at the apex. Drawn as a closed subpath so it can be knocked out of a wall.
 */
function arch(cx: number, halfWidth: number, base: number, spring: number, apex: number): string {
  const pull = apex + (spring - apex) * 0.34;
  return (
    `M${cx - halfWidth} ${base}V${spring}` +
    `Q${cx - halfWidth} ${pull} ${cx} ${apex}` +
    `Q${cx + halfWidth} ${pull} ${cx + halfWidth} ${spring}` +
    `V${base}Z`
  );
}

/** A run of evenly spaced arches, for knocking an arcade into a wall. */
function arcade(
  count: number,
  startX: number,
  step: number,
  halfWidth: number,
  base: number,
  spring: number,
  apex: number,
): string {
  return Array.from({ length: count }, (_, i) =>
    arch(startX + i * step, halfWidth, base, spring, apex),
  ).join("");
}

/** A column: shaft, flared capital, plinth. */
function column(cx: number, halfWidth: number, top: number, base: number): string {
  const cap = halfWidth * 1.55;
  return (
    `M${cx - cap} ${top}H${cx + cap}V${top + 34}H${cx + halfWidth}V${base - 40}` +
    `H${cx + cap}V${base}H${cx - cap}V${base - 40}H${cx - halfWidth}V${top + 34}` +
    `H${cx - cap}Z`
  );
}

type BackdropVariant = "arcade" | "colonnade" | "panels" | "vault";

const compositions: Record<BackdropVariant, ReactNode> = {
  /** A cropped arcade wall: six openings cut through a full-bleed panel. */
  arcade: (
    <path
      fillRule="evenodd"
      d={`M-140 150H1340V1010H-140Z${arcade(6, 20, 250, 88, 1010, 600, 320)}`}
    />
  ),

  /** Entablature over a colonnade, with a low course behind the shafts. */
  colonnade: (
    <>
      <rect x="-140" y="150" width="1480" height="120" />
      <rect x="-140" y="820" width="1480" height="190" />
      {[70, 320, 570, 820, 1070, 1320].map((cx) => (
        <path key={cx} d={column(cx, 46, 270, 880)} />
      ))}
    </>
  ),

  /** Layered panels stepping back, with a single arch cut through the front one. */
  panels: (
    <>
      <path d="M-140-60H620V430l-110 110H-140Z" />
      <path d="M760-60h580V520H850l-90-90Z" />
      <path fillRule="evenodd" d={`M300 520H1340V1010H300Z${arch(660, 150, 1010, 830, 600)}`} />
      <rect x="-140" y="660" width="330" height="350" />
    </>
  ),

  /** Vaulting: solid arches rising from a plinth under a deep course. */
  vault: (
    <>
      <rect x="-140" y="-60" width="1480" height="150" />
      {[40, 400, 760, 1120].map((cx) => (
        <path key={cx} d={arch(cx, 165, 1010, 620, 200)} />
      ))}
      <rect x="-140" y="930" width="1480" height="120" />
    </>
  ),
};

interface SectionBackdropProps {
  variant: BackdropVariant;
  /** Drops the paper grain, for sections already carrying a tinted ground. */
  grain?: boolean;
  className?: string;
}

export function SectionBackdrop({ variant, grain = true, className }: SectionBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        className="absolute inset-0 h-full w-full scale-150 text-accent opacity-[0.05]"
      >
        <g fill="currentColor">{compositions[variant]}</g>
      </svg>

      {grain && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--foreground)_1px,transparent_0)] bg-size-[22px_22px] opacity-[0.02]" />
      )}
    </div>
  );
}
