/**
 * The Our Story quatrefoil trellis — a seamless Moroccan ogee lattice.
 *
 * One SVG `<pattern>`, drawn once and repeated by the browser: a handful of DOM
 * nodes, exact at any device pixel ratio, and mathematically regular — every
 * motif on the same grid, no jitter, no scatter. It reads as one calm field
 * printed into the ground, the way foil is stamped into premium stock, rather
 * than as individually placed ornaments.
 *
 * Composition (which corners carry the pattern and which stay empty) is applied
 * by the host section as a mask, not baked in here, so this file stays a pure,
 * reusable, seamless tile.
 *
 * A single antique gold. The emboss is one lit edge a third of a pixel up-left
 * of the groove at low opacity — felt more than seen, no bevel, shine or gloss.
 */

/** The one antique gold. No alternates — a print house holds its colour. */
const GOLD = "#CFA85A";
/** The lit edge of the groove. */
const HIGHLIGHT = "#E7D3A0";

/** Column spacing and cell half-dimensions — ~10% larger than the last pass. */
const S = 123;
const W2 = 75;
const H2 = 80;

const TILE_W = 2 * S;
const TILE_H = 2 * H2;

/** One pointed-oval ogee cell centred at (cx, cy), mirror-symmetric on both axes. */
function ogee(cx: number, cy: number): string {
  const cxk = W2 * 0.72;
  const cyk = H2 * 0.72;
  return (
    `M${cx} ${cy - H2}` +
    `C${cx + cxk} ${cy - H2} ${cx + W2} ${cy - cyk} ${cx + W2} ${cy}` +
    `C${cx + W2} ${cy + cyk} ${cx + cxk} ${cy + H2} ${cx} ${cy + H2}` +
    `C${cx - cxk} ${cy + H2} ${cx - W2} ${cy + cyk} ${cx - W2} ${cy}` +
    `C${cx - W2} ${cy - cyk} ${cx - cxk} ${cy - H2} ${cx} ${cy - H2}Z`
  );
}

/**
 * The seamless tile: a phase-0 column on the tile's vertical edges and a
 * phase-shifted column down the middle offset a half-cell, so the two
 * interlock. Cells crossing the tile edges are completed by the neighbouring
 * tiles, so the repeat has no seam in either direction.
 */
const TRELLIS = [
  ogee(0, 0),
  ogee(0, TILE_H),
  ogee(TILE_W, 0),
  ogee(TILE_W, TILE_H),
  ogee(S, H2),
  ogee(S, H2 - TILE_H),
  ogee(S, H2 + TILE_H),
].join("");

export function OurStoryLattice({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="akram-trellis" width={TILE_W} height={TILE_H} patternUnits="userSpaceOnUse">
          {/* Lit edge, a third of a pixel up-left — the shallow press. */}
          <path
            d={TRELLIS}
            transform="translate(-0.35 -0.35)"
            fill="none"
            stroke={HIGHLIGHT}
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeLinejoin="round"
          />
          <path d={TRELLIS} fill="none" stroke={GOLD} strokeWidth="1" strokeLinejoin="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#akram-trellis)" />
    </svg>
  );
}
