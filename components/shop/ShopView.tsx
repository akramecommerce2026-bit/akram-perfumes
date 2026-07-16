"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { FilterDrawer } from "@/components/shop/FilterDrawer";
import { Pagination } from "@/components/shop/Pagination";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBar } from "@/components/shop/SearchBar";
import { SortDropdown } from "@/components/shop/SortDropdown";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  filtersToQuery,
  type ShopFilterState,
} from "@/components/shop/filter-state";
import { PAGE_SIZE, filterSummaries, paginate, sortSummaries } from "@/lib/product-filters";
import type { Category } from "@/types/category";
import type { ProductSort, ProductSummary } from "@/types/product";

interface ShopViewProps {
  products: readonly ProductSummary[];
  categories: readonly Category[];
}

/**
 * Client orchestrator for the Shop page. Receives the full summary set from the
 * server and applies search / filter / sort / pagination in-memory using the
 * shared pure helpers — the same helpers the service uses server-side, so the
 * rules stay identical when this moves to Supabase-backed queries.
 *
 * `?collection=<category-slug>` preselects that category, so links from the
 * homepage land on a filtered Shop. It is read here rather than on the server so
 * the page keeps its static/ISR rendering. An unknown slug is ignored and the
 * full catalogue shows — a stale link never becomes an error page.
 */
export function ShopView({ products, categories }: ShopViewProps) {
  const collectionParam = useSearchParams().get("collection");
  const presetCategory = useMemo(
    () => categories.find((category) => category.slug === collectionParam)?.slug ?? null,
    [categories, collectionParam],
  );

  const [filters, setFilters] = useState<ShopFilterState>(() => ({
    ...EMPTY_FILTERS,
    categorySlug: presetCategory,
  }));
  const [sort, setSort] = useState<ProductSort>("featured");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Re-apply when the URL changes under a mounted ShopView (e.g. a second
  // collection link). Adjusting state during render is React's supported reset
  // pattern and avoids an effect + extra commit.
  const [appliedCollection, setAppliedCollection] = useState(collectionParam);
  if (collectionParam !== appliedCollection) {
    setAppliedCollection(collectionParam);
    setFilters((previous) => ({ ...previous, categorySlug: presetCategory }));
    setPage(1);
  }

  const query = useMemo(() => filtersToQuery(filters), [filters]);
  const filtered = useMemo(() => filterSummaries(products, query), [products, query]);
  const sorted = useMemo(() => sortSummaries(filtered, sort), [filtered, sort]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Clamp during render so a shrinking result set never strands us on an empty page.
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const pageItems = useMemo(
    () => paginate(sorted, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE),
    [sorted, currentPage],
  );

  // Changing filters or sort returns to the first page (handled in the setters,
  // not an effect, to avoid cascading renders).
  function updateFilters(patch: Partial<ShopFilterState>) {
    setFilters((previous) => ({ ...previous, ...patch }));
    setPage(1);
  }

  function clearFilters() {
    setFilters((previous) => ({ ...EMPTY_FILTERS, search: previous.search }));
    setPage(1);
  }

  function changeSort(next: ProductSort) {
    setSort(next);
    setPage(1);
  }

  const activeCount = countActiveFilters(filters);

  return (
    <div>
      {/* Mobile / tablet sticky filter + sort controls */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-accent"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-semibold text-accent-foreground">
              {activeCount}
            </span>
          )}
        </button>
        <SortDropdown value={sort} onChange={changeSort} className="flex-1" />
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <ProductFilters
              state={filters}
              categories={categories}
              onChange={updateFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <SearchBar value={filters.search} onChange={(value) => updateFilters({ search: value })} />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {total} {total === 1 ? "product" : "products"}
            </p>
            <SortDropdown value={sort} onChange={changeSort} className="hidden w-56 lg:block" />
          </div>

          <ProductGrid products={pageItems} />

          {total > 0 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
              className="pt-4"
            />
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        state={filters}
        categories={categories}
        onChange={updateFilters}
        onClear={clearFilters}
        resultCount={total}
      />
    </div>
  );
}
