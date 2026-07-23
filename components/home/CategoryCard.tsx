import Image from "next/image";
import Link from "next/link";

import { Surface } from "@/components/common/surface";
import { isRemoteImage } from "@/lib/is-remote-image";
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
      <Surface
        interactive
        className="flex h-full flex-col overflow-hidden border-[color-mix(in_oklab,var(--accent)_36%,transparent)]"
      >
        {/* Portrait, not square: gives the bottle room to stand, and lets four
            tiles hold a row without the artwork shrinking to a thumbnail. */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              unoptimized={isRemoteImage(category.imageUrl)}
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </div>

        {/* Name plate: the exact brand burgundy from the Our Story section
            background (oklch(0.25 0.072 18)), seating the label like a nameplate
            on the tile. Crisp white text on the deep burgundy gives strong
            contrast and keeps the name — not the panel — the focus. */}
        <div className="flex flex-1 flex-col items-center justify-center bg-[oklch(0.25_0.072_18)] px-3 py-4">
          {/* One line reserved: "Solid Perfumes" wraps where "Attars" does not,
              and a wrapped label would make its tile taller than its neighbours. */}
          {/* Extrabold white for presence against the burgundy. Size and tracking
              are set so the longest label ("Solid Perfumes") stays on one line at
              every column count — line-clamp never has to truncate. Mobile 2-up is
              the tightest fit (~138px of inner width), so tracking is close there
              and opens up at sm where the larger 20px has room. */}
          <h3 className="font-heading line-clamp-1 text-center text-[14px] font-extrabold tracking-[0.05em] text-white uppercase sm:text-[20px] sm:tracking-[0.16em]">
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
