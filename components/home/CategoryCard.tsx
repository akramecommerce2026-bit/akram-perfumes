import Image from "next/image";
import Link from "next/link";

import { OrnamentFrame } from "@/components/common/ornament-frame";
import type { Category } from "@/types/category";

/**
 * One category tile: artwork inside a gold ornamental frame, with the name
 * beneath it.
 *
 * The frame sits in a padded well so the ornament reads as a mount around the
 * picture rather than a line drawn on top of it. Hovering warms the frame and
 * eases the image in — the card itself stays put, which keeps a row of four calm.
 *
 * Everything shown is authored in the admin; a category with no artwork yet
 * renders as an empty mount rather than a broken image.
 */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      aria-label={`Shop ${category.name}`}
      className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {/* The mount. Padding is what sells the frame as a mount rather than a
          border, so it is generous and grows with the card. Left unfilled so the
          ivory page shows through and the gold reads as inlaid into the page
          rather than as a white card floating on it; hover warms the well
          instead of switching a background on. */}
      <div className="relative rounded-lg p-3 transition-colors duration-500 group-hover:bg-accent/[0.05] sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
          {category.imageUrl && (
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </div>

        {/* Hover brightens the gold rather than moving anything. */}
        <OrnamentFrame className="opacity-75 transition-opacity duration-500 ease-out group-hover:opacity-100 motion-reduce:transition-none" />
      </div>

      {/* One line reserved: "Solid Perfumes" wraps where "Attars" does not, and a
          wrapped label would make its tile taller than its neighbours. */}
      <h3 className="mt-4 line-clamp-1 text-center text-[13px] font-semibold tracking-[0.14em] text-foreground uppercase transition-colors duration-300 group-hover:text-accent-foreground motion-reduce:transition-none">
        {category.name}
      </h3>
    </Link>
  );
}
