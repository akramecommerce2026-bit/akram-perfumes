import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { CategoryArchCard } from "@/components/home/CategoryArchCard";
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
    <Section spacing="lg">
      <SectionHeading
        eyebrow="Curated Selection"
        title="Shop by Category"
        subtitle="Explore fragrances crafted for every personality and every occasion."
      />

      {/*
        A centred row of fixed-width cards rather than a fixed column count.

        The reference runs six categories across; this catalogue currently has
        four. In a six-column grid those four would sit left-aligned against two
        empty cells, which is the opposite of the symmetry the layout wants.
        Centring a wrapped flex row keeps the cards identically sized and evenly
        spaced at any count — four centre now, six fill the row if two more are
        published, and no card ever changes proportion.
      */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-10 sm:gap-x-8 lg:mt-14">
        {categories.map((category) => (
          <div key={category.id} className="w-[42%] max-w-[184px] sm:w-[168px] lg:w-[184px]">
            <CategoryArchCard category={category} />
          </div>
        ))}
      </div>
    </Section>
  );
}
