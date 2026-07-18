import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/types/category";

/**
 * A category tile shaped as a Mughal pointed arch.
 *
 * Separate from CategoryCard on purpose: that one is shared with the Collections
 * page, which is out of scope here, so this arch treatment stays scoped to the
 * homepage's Shop by Category section and Collections is left untouched.
 *
 * The silhouette is one path used twice — as a mask that cuts the white card and
 * its artwork to the arch, and as a stroked outline drawn over it for the gold
 * keyline. Both share the same geometry and the card's aspect ratio matches the
 * viewBox, so the mask and the outline register exactly at every size.
 */

/** The arch: vertical springing, an ogee sweep to a point, softened base. */
const ARCH =
  "M2,228 V118 C2,58 40,13 92,3 C144,13 182,58 182,118 V228 A9,9 0 0 1 173,237 H11 A9,9 0 0 1 2,228 Z";

const ARCH_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 184 240' preserveAspectRatio='none'%3E%3Cpath d='${ARCH}' fill='%23fff'/%3E%3C/svg%3E")`;

/**
 * The faint lattice inside the card — an overlapping-circles grid, the
 * construction traditional Islamic geometry is built from, and seamless because
 * the circles sit on a regular grid. Drawn in SVG at a whisper: present when the
 * eye rests on it, invisible when it is on the product.
 */
const CARD_PATTERN =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cg fill='none' stroke='%23a07d33' stroke-opacity='0.5' stroke-width='0.8'%3E%3Ccircle cx='0' cy='0' r='22'/%3E%3Ccircle cx='44' cy='0' r='22'/%3E%3Ccircle cx='0' cy='44' r='22'/%3E%3Ccircle cx='44' cy='44' r='22'/%3E%3Ccircle cx='22' cy='22' r='22'/%3E%3C/g%3E%3C/svg%3E")`;

export function CategoryArchCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      aria-label={`Shop ${category.name}`}
      className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {/*
        Aspect locked to the viewBox so mask and outline never drift apart.

        The shadow is a drop-shadow filter, not a box-shadow: a box-shadow on the
        masked card below would be cut away by that same mask, whereas
        drop-shadow follows the arch's alpha and so traces the silhouette. It
        lifts a little on hover and no further.
      */}
      <div className="relative aspect-[184/240] w-full transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [filter:drop-shadow(0_1px_2px_oklch(0.3_0.03_70/0.10))] group-hover:[filter:drop-shadow(0_6px_14px_oklch(0.3_0.03_70/0.16))] motion-reduce:transition-none">
        {/* White card, cut to the arch, carrying the lattice and the artwork. */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            maskImage: ARCH_MASK,
            WebkitMaskImage: ARCH_MASK,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: CARD_PATTERN, backgroundSize: "44px 44px" }}
          />

          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 184px, (min-width: 640px) 170px, 45vw"
              /* contain, never cropped, inset so the product floats in
                 whitespace rather than filling the arch. */
              className="object-contain p-6 pt-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </div>

        {/* The gold keyline, drawn over the card so the stroke is never masked. */}
        <svg
          viewBox="0 0 184 240"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={ARCH}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-70 group-hover:opacity-100 motion-reduce:transition-none"
          />
        </svg>
      </div>

      <h3 className="mt-5 text-center text-[15px] font-medium text-[oklch(0.28_0.005_60)]">
        {category.name}
      </h3>
    </Link>
  );
}
