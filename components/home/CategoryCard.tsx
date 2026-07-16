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
      className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative rounded-lg bg-card p-2 transition-colors duration-500 group-hover:bg-accent/5 sm:p-2.5">
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

        <OrnamentFrame className="opacity-70 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none" />
      </div>

      <h3 className="mt-3.5 text-center text-[15px] font-semibold text-foreground transition-colors duration-300 group-hover:text-accent-foreground motion-reduce:transition-none">
        {category.name}
      </h3>
    </Link>
  );
}
