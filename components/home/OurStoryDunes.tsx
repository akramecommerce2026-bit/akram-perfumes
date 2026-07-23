/**
 * The Our Story lower artwork — sculpted desert dunes, nothing else.
 *
 * No architecture of any kind: there is no dome, minaret, mosque, skyline,
 * crescent, pillar, arch or tower path in this file. Five overlapping dune
 * ridges roll across the bottom, each a long asymmetric Bézier sweep — a single
 * crest at its own x, its own height and its own width — so no two share a
 * rhythm and none reads as a repeating hump. The ridges layer back to front,
 * lightest and highest behind, deepest in front, to build depth from overlap
 * alone.
 *
 * Warm AKRAM sand only, each ridge a subtle two-stop vertical gradient (a touch
 * lighter at its crest than at its base) so nothing is a flat fill. No stroke,
 * shadow, outline, glow, blur or SVG filter. The whole stack fades upward
 * through a long mask so the sand dissolves into the burgundy with no hard edge.
 *
 * Fully vector; the host section places it in the bottom band, behind content.
 * Static: no animation.
 */

const W = 2000;
const H = 340;

/**
 * Back to front. Each ridge is authored by hand — long shallow approach, a
 * single soft crest, a quicker fall — with crests at 1300 / 640 / 1050 / 400 /
 * 1580 and descending heights, so the horizon never repeats.
 */
const DUNES: { d: string; fill: string; opacity: number }[] = [
  {
    // Back — highest, lightest, crest right of centre.
    d: `M0 214C520 198 940 184 1300 188C1560 191 1820 214 2000 204L2000 ${H}H0Z`,
    fill: "url(#dune-a)",
    opacity: 0.55,
  },
  {
    // Crest left of centre.
    d: `M0 236C300 216 540 206 760 218C1120 240 1580 246 2000 232L2000 ${H}H0Z`,
    fill: "url(#dune-b)",
    opacity: 0.68,
  },
  {
    // Broad low crest, centre-right.
    d: `M0 252C640 252 900 234 1160 236C1480 239 1800 258 2000 250L2000 ${H}H0Z`,
    fill: "url(#dune-c)",
    opacity: 0.8,
  },
  {
    // Crest well to the left, long fall to the right.
    d: `M0 274C230 268 340 256 520 266C980 292 1540 272 2000 280L2000 ${H}H0Z`,
    fill: "url(#dune-d)",
    opacity: 0.9,
  },
  {
    // Front — lowest, deepest, long crest to the right.
    d: `M0 298C560 294 1180 286 1580 288C1800 289 1910 300 2000 296L2000 ${H}H0Z`,
    fill: "url(#dune-e)",
    opacity: 1,
  },
];

/** Ridge gradients: [crest tone, base tone], back → front, light → deep. */
const GRADS: [string, string][] = [
  ["#EAC98F", "#E5C186"],
  ["#E0B878", "#DBB06C"],
  ["#DCAB63", "#D6A055"],
  ["#CD8E4A", "#C2803E"],
  ["#B0763C", "#A86A34"],
];

export function OurStoryDunes({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        {GRADS.map(([crest, base], i) => (
          <linearGradient key={i} id={`dune-${"abcde"[i]}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={crest} />
            <stop offset="100%" stopColor={base} />
          </linearGradient>
        ))}

        {/* Long upward fade: the sand dissolves into the burgundy with no edge. */}
        <linearGradient id="dune-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="78%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="dune-mask">
          <rect width={W} height={H} fill="url(#dune-fade)" />
        </mask>
      </defs>

      <g mask="url(#dune-mask)">
        {DUNES.map((dune, i) => (
          <path key={i} d={dune.d} fill={dune.fill} opacity={dune.opacity} />
        ))}
      </g>
    </svg>
  );
}
