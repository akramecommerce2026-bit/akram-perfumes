import { cn } from "@/lib/utils";

/**
 * Decorative gold frame — an original ornament drawn for this project, in the
 * spirit of Mughal cusped-arch and jali work.
 *
 * Three ideas do the work of making it read as crafted rather than as a border:
 * an ogee (S-curved) bracket instead of a plain radius, a hairline that shadows
 * it at a constant inset the way an inlaid keyline would, and a lotus bud seated
 * in each corner where the two curves meet. Small lozenges mark the midpoint of
 * each run, which is what stops the long edges reading as bare rule.
 *
 * The pieces are fixed-size and positioned against the box rather than one SVG
 * stretched to fit: the flourishes hold their proportions at every card size
 * while only the straight runs grow. Purely presentational — hidden from
 * assistive tech, and never in the way of a click.
 */

/** Corner bracket: ogee curve, shadowing keyline, and a seated lotus bud. */
function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
      className={cn("absolute size-7 text-accent sm:size-8", className)}
    >
      {/* Outer bracket. The two cubics form an ogee: the line eases out of the
          straight, tightens through the turn, then eases back out. */}
      <path
        d="M0.6 34 V15 C0.6 9.2 2.4 5 5.4 2.9 C7.6 1.3 10.9 0.6 15 0.6 H34"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Keyline, shadowing the bracket at a constant inset. */}
      <path
        d="M5.6 34 V16.4 C5.6 11.8 7 8.5 9.3 6.8 C11.1 5.5 13.6 5 16.4 5 H34"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Lotus bud seated in the turn, on the diagonal. */}
      <path
        d="M11.6 8.2 C13.1 9.2 13.9 10.4 13.5 11.6 C12.3 12 11.1 11.2 10.1 9.7 C9.7 8.5 10.4 7.8 11.6 8.2 Z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Two pinpoints flanking the bud — the detail that reads as handwork. */}
      <circle cx="17.5" cy="4.6" r="0.5" fill="currentColor" opacity="0.45" />
      <circle cx="4.6" cy="17.5" r="0.5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** Lozenge marking the midpoint of a run. */
function EdgeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className={cn("absolute size-2.5 text-accent", className)}
    >
      <path d="M5 1.2 L6.9 5 L5 8.8 L3.1 5 Z" fill="currentColor" opacity="0.4" />
      <path d="M5 2.6 L6.3 5 L5 7.4 L3.7 5 Z" fill="var(--background)" opacity="0.95" />
    </svg>
  );
}

export function OrnamentFrame({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-lg", className)}
    >
      {/* The run the corners resolve into. Kept lighter than the brackets so the
          corners carry the eye and the long edges stay quiet. */}
      <div className="absolute inset-0 rounded-lg border border-accent/20" />

      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0 -scale-x-100" />
      <Corner className="bottom-0 left-0 -scale-y-100" />
      <Corner className="right-0 bottom-0 -scale-100" />

      {/* Seated on the rule, centred on each run. */}
      <EdgeMark className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <EdgeMark className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
      <EdgeMark className="top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" />
      <EdgeMark className="top-1/2 right-0 translate-x-1/2 -translate-y-1/2" />
    </div>
  );
}
