import Image from "next/image";
import Link from "next/link";

import { Surface } from "@/components/common/surface";
import type { Category } from "@/types/category";

/**
 * One category tile: artwork edge-to-edge, with a name plate beneath it.
 *
 * Built on `Surface` so a category tile and a product card are visibly the same
 * object — gold hairline over white, lit top edge, the same warm-and-lift on
 * hover. The artwork runs to the hairline rather than sitting inside a mount:
 * at four-up the picture is the tile, and a frame drawn around it competes with
 * the thing it is framing.
 *
 * The one flourish is the rule under the name, which grows on hover. It and the
 * image are the only moving parts, which keeps a row of four calm.
 *
 * Everything shown is authored in the admin; a category with no artwork yet
 * renders as an empty well rather than a broken image.
 */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      aria-label={`Shop ${category.name}`}
      className="group block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Surface interactive className="flex h-full flex-col overflow-hidden">
        {/* Portrait, not square: gives the bottle room to stand, and lets four
            tiles hold a row without the artwork shrinking to a thumbnail. */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </div>

        {/* Name plate, divided by the same hairline the card is drawn with, so
            the rule belongs to the card rather than introducing a new weight. */}
        <div className="flex flex-1 flex-col items-center justify-center border-t border-[var(--hairline)] px-3 py-4">
          {/* One line reserved: "Solid Perfumes" wraps where "Attars" does not,
              and a wrapped label would make its tile taller than its neighbours. */}
          {/* Sized up from 13px, but only once there is width for it: at two-up
              on a phone, "Solid Perfumes" at 15px with this tracking overruns the
              card and line-clamp truncates it. Mobile keeps the size that fits. */}
          <h3 className="line-clamp-1 text-center text-[13px] font-semibold tracking-[0.2em] text-foreground uppercase sm:text-[15px]">
            {category.name}
          </h3>

          <span
            aria-hidden="true"
            className="mt-2.5 h-px w-6 bg-accent transition-[width] duration-(--animate-duration-enter) ease-lux group-hover:w-11 motion-reduce:transition-none"
          />
        </div>
      </Surface>
    </Link>
  );
}
