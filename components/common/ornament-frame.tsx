import { cn } from "@/lib/utils";

/**
 * Decorative gold frame — an original ornament drawn here in SVG, in the spirit
 * of Mughal cusped arch work: a double keyline with a cusped bracket and a
 * lozenge at each corner.
 *
 * Built as four fixed-size corner pieces over a plain bordered box rather than
 * one stretched SVG, so the flourishes keep their proportions at any card size
 * while the straight runs simply grow. Purely presentational, so it is hidden
 * from assistive tech and never intercepts a click.
 */

function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("absolute size-6 text-accent sm:size-7", className)}
    >
      {/* outer bracket */}
      <path
        d="M1 28 V10 C1 5 5 1 10 1 H28"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* inner keyline, echoing the outer at a fixed inset */}
      <path
        d="M6 28 V12 C6 8.7 8.7 6 12 6 H28"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* corner lozenge */}
      <path
        d="M11 7.5 L12.5 9 L11 10.5 L9.5 9 Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  );
}

export function OrnamentFrame({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-lg", className)}
    >
      {/* The continuous keyline the corners resolve into. */}
      <div className="absolute inset-0 rounded-lg border border-accent/30" />
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0 -scale-x-100" />
      <Corner className="bottom-0 left-0 -scale-y-100" />
      <Corner className="right-0 bottom-0 -scale-100" />
    </div>
  );
}
