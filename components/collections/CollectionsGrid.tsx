import { CategoryCard } from "@/components/home/CategoryCard";
import type { Category } from "@/types/category";

/** Grid of category tiles, sharing the homepage's card so the two never drift. */
export function CollectionsGrid({ categories }: { categories: readonly Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
