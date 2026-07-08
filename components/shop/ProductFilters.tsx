"use client";

import { FilterGroup, type FilterOption } from "@/components/shop/FilterGroup";
import {
  countActiveFilters,
  toggleValue,
  type ShopFilterState,
} from "@/components/shop/filter-state";
import { PRICE_BUCKETS } from "@/lib/product-filters";
import type { Category } from "@/types/category";
import {
  FRAGRANCE_FAMILIES,
  FRAGRANCE_FAMILY_LABELS,
  GENDER_LABELS,
  GENDERS,
  OCCASION_LABELS,
  OCCASIONS,
} from "@/types/product-attributes";
import type { FragranceFamily, Gender, Occasion } from "@/types/product-attributes";

interface ProductFiltersProps {
  state: ShopFilterState;
  categories: readonly Category[];
  onChange: (patch: Partial<ShopFilterState>) => void;
  onClear: () => void;
}

export function ProductFilters({ state, categories, onChange, onClear }: ProductFiltersProps) {
  const activeCount = countActiveFilters(state);

  const categoryOptions: FilterOption[] = [
    { value: "", label: "All Categories" },
    ...categories.map((category) => ({ value: category.slug, label: category.name })),
  ];

  const priceOptions: FilterOption[] = [
    { value: "", label: "All Prices" },
    ...PRICE_BUCKETS.map((bucket) => ({ value: bucket.id, label: bucket.label })),
  ];

  const familyOptions: FilterOption[] = FRAGRANCE_FAMILIES.map((family) => ({
    value: family,
    label: FRAGRANCE_FAMILY_LABELS[family],
  }));

  const genderOptions: FilterOption[] = GENDERS.map((gender) => ({
    value: gender,
    label: GENDER_LABELS[gender],
  }));

  const occasionOptions: FilterOption[] = OCCASIONS.map((occasion) => ({
    value: occasion,
    label: OCCASION_LABELS[occasion],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-accent transition-opacity hover:opacity-80"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup
        title="Categories"
        name="filter-category"
        options={categoryOptions}
        selected={state.categorySlug ? [state.categorySlug] : []}
        onToggle={(value) => onChange({ categorySlug: value || null })}
      />

      <div className="border-t border-border pt-6">
        <FilterGroup
          title="Price Range"
          name="filter-price"
          options={priceOptions}
          selected={state.priceBucketId ? [state.priceBucketId] : []}
          onToggle={(value) => onChange({ priceBucketId: value || null })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <FilterGroup
          title="Fragrance Family"
          name="filter-family"
          multiple
          options={familyOptions}
          selected={state.fragranceFamilies}
          onToggle={(value) =>
            onChange({ fragranceFamilies: toggleValue(state.fragranceFamilies, value as FragranceFamily) })
          }
        />
      </div>

      <div className="border-t border-border pt-6">
        <FilterGroup
          title="Gender"
          name="filter-gender"
          multiple
          options={genderOptions}
          selected={state.genders}
          onToggle={(value) => onChange({ genders: toggleValue(state.genders, value as Gender) })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <FilterGroup
          title="Occasion"
          name="filter-occasion"
          multiple
          options={occasionOptions}
          selected={state.occasions}
          onToggle={(value) => onChange({ occasions: toggleValue(state.occasions, value as Occasion) })}
        />
      </div>

      <div className="border-t border-border pt-6">
        <FilterGroup
          title="Availability"
          name="filter-availability"
          multiple
          options={[{ value: "in-stock", label: "In stock only" }]}
          selected={state.inStockOnly ? ["in-stock"] : []}
          onToggle={() => onChange({ inStockOnly: !state.inStockOnly })}
        />
      </div>
    </div>
  );
}
