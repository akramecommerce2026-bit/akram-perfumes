/**
 * The Testimonials ground.
 *
 * Four layers, deliberately weakest at the front:
 *
 *   1. Paper — fibre and mottle, applied as the section's own background image.
 *   2. Lattice — a girih-style geometric pattern, strongest at the outer edges
 *      and masked out of the middle so the card sits in calm ground.
 *   3. Lighting — a broad warm bloom plus a tighter highlight behind the card,
 *      so it sits in light rather than on a flat field.
 *   4. Motes — a dozen slow-drifting particles. Atmosphere only; at this size
 *      and alpha they register as air, not as dots.
 *
 * There is no architecture here any more. Arches, domes, minarets, an arcade
 * and a skyline all lived in this file across earlier rounds; each competed
 * with the card, and the section reads as more expensive without them. The
 * geometry now carries the whole identity.
 *
 * These are overlay layers at `-z-10`, which only sits behind content because
 * the host section carries `isolate`. Without a stacking context on the section
 * the negative index escapes to an ancestor and the backdrop paints *underneath*
 * the section's own background — invisible. See Testimonials.tsx.
 */

/** Antique gold. Held out of yellow, and the only colour the lattice uses. */
const GOLD = "#C8A96A";

/** Tile pitch. Large on purpose: the motif should read as spaced, not woven. */
const TILE = 232;

/** Star half-width. Its eight points reach TILE * 0.2, leaving open ground. */
const R = 33;

/**
 * The lit edge of an engraved groove. A cut into paper has two edges — one in
 * shadow, one catching light — and drawing only the dark one reads as ink on
 * the surface. This warm near-white, offset a fraction down-right of the gold,
 * is what makes the lattice read as pressed *into* the stock.
 */
const HIGHLIGHT = "#FFFBF2";

/**
 * One eight-point star: an axis-aligned square crossed by a 45° square. Both
 * squares share a circumradius, so all eight points land at the same distance
 * and the star reads as regular rather than as two stacked shapes.
 */
function star(cx: number, cy: number, r: number): string {
  const d = r * Math.SQRT2;
  return (
    `M${cx - r} ${cy - r}H${cx + r}V${cy + r}H${cx - r}Z` +
    `M${cx} ${cy - d}L${cx + d} ${cy}L${cx} ${cy + d}L${cx - d} ${cy}Z`
  );
}

/**
 * A seamless girih lattice: stars at the tile's centre and corners, joined tip
 * to tip. The corner stars are quartered by the tile edges and complete against
 * their neighbours, and every connector either lies on an edge or is mirrored
 * across one, so the tile repeats with no visible seam.
 *
 * The connectors are what turn isolated stars into a lattice — the octagonal
 * voids between them are formed by the negative space rather than drawn.
 */
function latticeTile(): string {
  const c = TILE / 2;
  const tip = R * Math.SQRT2;

  const stars = [
    star(c, c, R),
    star(0, 0, R),
    star(TILE, 0, R),
    star(0, TILE, R),
    star(TILE, TILE, R),
  ].join("");

  // Diagonals: each corner star's inner point to the centre star's facing point.
  const diagonals = [
    [R, R, c - R, c - R],
    [TILE - R, R, c + R, c - R],
    [R, TILE - R, c - R, c + R],
    [TILE - R, TILE - R, c + R, c + R],
  ]
    .map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`)
    .join("");

  // Edge runs: corner star to corner star along the tile boundary. Drawn on the
  // edge itself, so each is completed by the adjoining tile.
  const edges =
    `M${tip} 0H${TILE - tip}` +
    `M${tip} ${TILE}H${TILE - tip}` +
    `M0 ${tip}V${TILE - tip}` +
    `M${TILE} ${tip}V${TILE - tip}`;

  return stars + diagonals + edges;
}

const LATTICE = latticeTile();

/** Deterministic mote field — no Math.random, so SSR and client agree. */
const motes = [
  { l: "8%", t: "22%", s: 3, d: 0, u: 26 },
  { l: "17%", t: "64%", s: 2, d: 5, u: 31 },
  { l: "26%", t: "12%", s: 2, d: 11, u: 28 },
  { l: "34%", t: "78%", s: 3, d: 3, u: 34 },
  { l: "43%", t: "34%", s: 2, d: 8, u: 29 },
  { l: "57%", t: "18%", s: 2, d: 14, u: 32 },
  { l: "66%", t: "70%", s: 3, d: 2, u: 27 },
  { l: "74%", t: "40%", s: 2, d: 9, u: 35 },
  { l: "83%", t: "26%", s: 3, d: 6, u: 30 },
  { l: "91%", t: "58%", s: 2, d: 12, u: 33 },
  { l: "12%", t: "44%", s: 2, d: 16, u: 29 },
  { l: "95%", t: "16%", s: 2, d: 4, u: 36 },
] as const;

const moteKeyframes = `
@keyframes akram-mote {
  0%   { transform: translate3d(0,0,0); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translate3d(6px,-38px,0); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .akram-mote { animation: none !important; opacity: 0.5; }
}`;

/**
 * The lattice, tiled across the section and faded out of the middle.
 *
 * One `<pattern>` fill rather than a repeated raster: it stays vector, so it is
 * exact at any device pixel ratio, and the browser rasterises a single tile
 * however large the section grows.
 *
 * The radial mask is what keeps it from becoming wallpaper. The pattern holds
 * at full strength in the corners and is gone before it reaches the card, so
 * the geometry frames the content instead of running underneath it.
 */
function GeometricLattice() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <pattern id="akram-girih" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {/* Lit edge first, then the cut itself directly over it. */}
          <path
            d={LATTICE}
            transform="translate(1.1 1.1)"
            fill="none"
            stroke={HIGHLIGHT}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={LATTICE}
            fill="none"
            stroke={GOLD}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </pattern>

        {/* Black hides, white shows: clear through the middle, present at the rim. */}
        {/*
          * Black hides, white shows. Full strength across the outer third and
          * gone by the middle, so the geometry frames the card rather than
          * running beneath it.
          */}
        <radialGradient id="akram-girih-fade" cx="50%" cy="50%" r="82%">
          <stop offset="0%" stopColor="#000" />
          <stop offset="30%" stopColor="#000" />
          <stop offset="52%" stopColor="#8c8c8c" />
          <stop offset="68%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fff" />
        </radialGradient>
        <mask id="akram-girih-mask">
          <rect width="100%" height="100%" fill="url(#akram-girih-fade)" />
        </mask>
      </defs>

      <rect
        width="100%"
        height="100%"
        fill="url(#akram-girih)"
        mask="url(#akram-girih-mask)"
        /*
         * 20%. Visibility here comes from four things together — this opacity,
         * a 1.5px stroke, a larger tile and the emboss highlight — not from
         * opacity alone. Earlier passes moved only this number and the pattern
         * stayed invisible.
         */
        opacity="0.2"
      />
    </svg>
  );
}

export function TestimonialsBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <style>{moteKeyframes}</style>

      {/* 2. Geometry — the section's visual identity, held to the outer field. */}
      <GeometricLattice />

      {/* 3. Lighting: the broad bloom, then a tighter highlight behind the card. */}
      <div className="absolute inset-0 bg-[radial-gradient(58%_50%_at_50%_52%,color-mix(in_oklab,var(--accent)_13%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(34%_30%_at_50%_54%,color-mix(in_oklab,var(--accent)_9%,transparent),transparent_72%)]" />

      {/* 4. Motes. */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="akram-mote absolute rounded-full bg-accent opacity-0"
          style={{
            left: m.l,
            top: m.t,
            width: m.s,
            height: m.s,
            animation: `akram-mote ${m.u}s ease-in-out ${m.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
