import { Section } from "@/components/common/section";
import { SectionBackdrop } from "@/components/common/section-backdrop";
import { SectionHeading } from "@/components/common/section-heading";
import { CategoryCard } from "@/components/home/CategoryCard";
import { productService } from "@/services/product-service";

/**
 * Shop by category.
 *
 * A Server Component reading the live category list — the tiles are whatever the
 * admin has published, in their configured display order. Nothing is hardcoded,
 * so adding or renaming a category in `/admin/categories` changes the homepage
 * without a deploy. Renders nothing at all rather than an empty heading when no
 * categories exist.
 */
export async function ShopByCategory() {
  const categories = await productService.getCategories();
  if (categories.length === 0) return null;

  return (
    <Section spacing="lg" className="relative overflow-hidden">
      <SectionBackdrop variant="arcade" />

      <SectionHeading
        eyebrow="Curated Selection"
        title="Shop by Category"
        subtitle="Explore fragrances crafted for every personality and every occasion."
      />

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}
