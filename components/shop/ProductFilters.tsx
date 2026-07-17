"use client";

import { FilterGroup, type FilterOption } from "@/components/shop/FilterGroup";
import {
  countActiveFilters,
  toggleValue,
  type ShopFilterState,
} from "@/components/shop/filter-state";
import { PRICE_BUCKETS } from "@/lib/product-filters";
import type { Category } from "@/types/category";
import { GENDER_LABELS, GENDERS } from "@/types/product-attributes";
import type { Gender } from "@/types/product-attributes";

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

  const genderOptions: FilterOption[] = GENDERS.map((gender) => ({
    value: gender,
    label: GENDER_LABELS[gender],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-9 items-center justify-between border-b border-border pb-2">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-foreground uppercase">Filters</h2>
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
