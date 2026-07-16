import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/types/category";

/**
 * One category tile: square artwork with the name beneath it, matching the
 * product card's ratio and radius so the two grids share a rhythm.
 *
 * Everything shown is authored in the admin — the image comes from the category
 * record, not the component. A category with no artwork yet renders as a plain
 * tile rather than a broken image.
 */
export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      aria-label={`Shop ${category.name}`}
      className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {category.imageUrl && (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
      </div>

      <h3 className="mt-3 text-center text-[15px] font-semibold text-foreground transition-colors group-hover:text-accent-foreground motion-reduce:transition-none">
        {category.name}
      </h3>
    </Link>
  );
}
