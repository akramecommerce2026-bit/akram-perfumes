/**
 * Paper texture for a section ground.
 *
 * This replaces an earlier tiled star lattice. That approach could not work,
 * however far its opacity was lowered: vector strokes have edges, the eye finds
 * edges before it registers overall lightness, and a repeating motif is
 * something the eye can learn and then keep seeing. Any recognisable ornament
 * eventually reads as decoration.
 *
 * So there is no artwork here. The texture is fractal noise — the same
 * technique used to simulate paper stock — which has no motif, no repeat the
 * eye can lock onto, and no edges. There is nothing to recognise, so nothing to
 * notice; what is left is a ground that looks like a material rather than a
 * flat fill.
 *
 * Delivered as a `background-image` rather than as an overlay element, which is
 * both more accurate to the idea and a bug fix. The overlay version sat at
 * `-z-10`, and a negative z-index child paints *behind* its parent's own
 * background — so on any section with a background colour of its own (the
 * burgundy Brand Story) the texture was painted and then completely covered.
 * As a background layer it composites onto the section's colour the way ink
 * sits in stock, and there is no stacking order to get wrong.
 *
 * Two scales, because real paper has two:
 *
 *   Tooth — high-frequency fibre, the fine irregularity of a laid sheet. This
 *   is what stops a fill reading as printed ink.
 *
 *   Mottle — very low-frequency cloudiness, the slow variation in density you
 *   see holding good stock to the light. This is what gives depth; without it
 *   the tooth reads as uniform digital grain.
 *
 * Desaturated to pure luminance noise, so it lightens and darkens the ground
 * rather than tinting it — which is why one texture works on both the ivory and
 * the burgundy without a per-ground colour.
 */

/**
 * `stitchTiles="stitch"` matters: without it the noise is generated per tile
 * and the seams show as a faint grid, which would reintroduce exactly the
 * regular structure this is meant to avoid.
 */
function noiseSvg(frequency: number, octaves: number, opacity: number, size: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<filter id="n" x="0" y="0" width="100%" height="100%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="${frequency}" numOctaves="${octaves}" stitchTiles="stitch"/>` +
    `<feColorMatrix type="saturate" values="0"/>` +
    `</filter>` +
    `<rect width="100%" height="100%" filter="url(#n)" opacity="${opacity}"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * A `background-image` value carrying both paper layers.
 *
 * Apply to a section via `style`. Any `background-color` on the element shows
 * through beneath it, so the section keeps owning its own colour.
 *
 * @param strength Fibre opacity. The burgundy swallows noise and takes roughly
 *   double the ivory to land at the same apparent weight. These sit below the
 *   level at which texture becomes something you look at.
 */
export function paperTexture(strength: number): string {
  const tooth = noiseSvg(0.9, 4, strength, 260);
  // Mottle is the layer that betrays the texture. Too low a frequency and it
  // resolves into soft blotches you can point at; too much opacity and those
  // blotches lighten the ground unevenly. Kept high enough in frequency to stay
  // below the size the eye groups into shapes, and quiet enough to read as
  // depth rather than as clouds.
  const mottle = noiseSvg(0.03, 2, strength * 0.28, 700);
  return `${tooth}, ${mottle}`;
}
