"use client";

import { useMemo } from "react";

import { ProductSlider } from "@/components/shop/ProductSlider";
import { useMounted } from "@/lib/use-mounted";
import type { ProductSummary } from "@/types/product";

const STORAGE_KEY = "akram:recently-viewed";
const MAX_ITEMS = 8;

/**
 * Recently viewed.
 *
 * Browsing history is the visitor's own, so it lives in localStorage rather than
 * the backend — no schema, no request, and nothing to reconcile when they are
 * signed out. The list is written by the PDP itself (see RecordView).
 *
 * Renders nothing until mounted: the server has no way to know this list, so
 * anything drawn before hydration would be wrong and would shift the page.
 * `useMounted` gates on that via useSyncExternalStore, which is why the history
 * is read during render rather than assigned from an effect — the latter is a
 * cascading render, and the lint rule that forbids it is right.
 */
export function RecentlyViewed({ currentId }: { currentId: string }) {
  const mounted = useMounted();
  const items = useMemo(
    () => (mounted ? readHistory().filter((item) => item.id !== currentId) : []),
    [mounted, currentId],
  );

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className="flex flex-col gap-6">
      <h2 id="recently-viewed-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
        Recently Viewed
      </h2>
      <ProductSlider products={items} />
    </section>
  );
}

/** Reads the stored history, tolerating anything a hand-edited value might be. */
function readHistory(): ProductSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductSummary[]) : [];
  } catch {
    return [];
  }
}

/**
 * Records a view, most-recent first, and returns nothing — call it from the PDP.
 * Kept beside the reader so the shape of the stored value is defined once.
 */
export function recordView(product: ProductSummary): void {
  if (typeof window === "undefined") return;
  try {
    const next = [product, ...readHistory().filter((item) => item.id !== product.id)].slice(
      0,
      MAX_ITEMS,
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota exceeded — history is a nicety, never an error.
  }
}
