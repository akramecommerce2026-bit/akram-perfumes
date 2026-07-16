import type { ProductQuery, ProductSort, ProductSummary } from "@/types/product";

/** Default products per page for the Shop grid. */
export const PAGE_SIZE = 9;

export interface PriceBucket {
  readonly id: string;
  readonly label: string;
  /** Inclusive bounds in minor currency units (paise). */
  readonly min?: number;
  readonly max?: number;
}

export const PRICE_BUCKETS: readonly PriceBucket[] = [
  { id: "under-1000", label: "Under ₹1,000", max: 99900 },
  { id: "1000-2000", label: "₹1,000 – ₹2,000", min: 100000, max: 199900 },
  { id: "2000-4000", label: "₹2,000 – ₹4,000", min: 200000, max: 399900 },
  { id: "over-4000", label: "Over ₹4,000", min: 400000 },
];

export interface SortOption {
  readonly value: ProductSort;
  readonly label: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
];

/**
 * Pure filter over the summary read model. Shared by the service (server) and
 * the Shop page (client instant filtering) so the rules live in exactly one
 * place and behave identically wherever they run.
 */
export function filterSummaries(
  items: readonly ProductSummary[],
  query: ProductQuery,
): ProductSummary[] {
  return items.filter((product) => {
    if (query.search) {
      const term = query.search.trim().toLowerCase();
      if (term.length > 0) {
        const haystack =
          `${product.name} ${product.category.name} ${product.shortDescription}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
    }
    if (query.categorySlug && product.category.slug !== query.categorySlug) return false;
    if (query.genders?.length && !query.genders.includes(product.gender)) return false;
    if (query.inStockOnly && !product.inStock) return false;
    if (query.priceMin != null || query.priceMax != null) {
      const price = product.priceFrom?.amount ?? null;
      if (price == null) return false;
      if (query.priceMin != null && price < query.priceMin) return false;
      if (query.priceMax != null && price > query.priceMax) return false;
    }
    if (query.featured !== undefined && product.isFeatured !== query.featured) return false;
    if (query.signature !== undefined && product.isSignature !== query.signature) return false;
    return true;
  });
}

export function sortSummaries(
  items: readonly ProductSummary[],
  sort: ProductSort = "featured",
): ProductSummary[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => priceValue(a) - priceValue(b));
    case "price-desc":
      return copy.sort((a, b) => priceValue(b) - priceValue(a));
    case "rating-desc":
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "best-selling":
      return copy.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy.sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating,
      );
  }
}

export function paginate<T>(items: readonly T[], limit: number, offset: number): T[] {
  return items.slice(offset, offset + limit);
}

function priceValue(summary: ProductSummary): number {
  return summary.priceFrom?.amount ?? Number.POSITIVE_INFINITY;
}
