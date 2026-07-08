import { PRICE_BUCKETS } from "@/lib/product-filters";
import type { ProductQuery } from "@/types/product";
import type { FragranceFamily, Gender, Occasion } from "@/types/product-attributes";

/** UI state for the Shop filters + search. Maps directly onto a ProductQuery. */
export interface ShopFilterState {
  search: string;
  categorySlug: string | null;
  priceBucketId: string | null;
  genders: Gender[];
  fragranceFamilies: FragranceFamily[];
  occasions: Occasion[];
  inStockOnly: boolean;
}

export const EMPTY_FILTERS: ShopFilterState = {
  search: "",
  categorySlug: null,
  priceBucketId: null,
  genders: [],
  fragranceFamilies: [],
  occasions: [],
  inStockOnly: false,
};

/** Translate UI filter state into the query the service/filter helpers accept. */
export function filtersToQuery(state: ShopFilterState): ProductQuery {
  const bucket = state.priceBucketId
    ? PRICE_BUCKETS.find((entry) => entry.id === state.priceBucketId)
    : undefined;

  return {
    search: state.search || undefined,
    categorySlug: state.categorySlug ?? undefined,
    genders: state.genders.length ? state.genders : undefined,
    fragranceFamilies: state.fragranceFamilies.length ? state.fragranceFamilies : undefined,
    occasions: state.occasions.length ? state.occasions : undefined,
    priceMin: bucket?.min,
    priceMax: bucket?.max,
    inStockOnly: state.inStockOnly || undefined,
  };
}

/** Active sidebar filters (excludes free-text search, which lives in the toolbar). */
export function countActiveFilters(state: ShopFilterState): number {
  return (
    (state.categorySlug ? 1 : 0) +
    (state.priceBucketId ? 1 : 0) +
    state.genders.length +
    state.fragranceFamilies.length +
    state.occasions.length +
    (state.inStockOnly ? 1 : 0)
  );
}

export function toggleValue<T extends string>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}
