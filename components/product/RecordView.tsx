"use client";

import { useEffect } from "react";

import { recordView } from "@/components/product/RecentlyViewed";
import type { ProductSummary } from "@/types/product";

/**
 * Writes this product into the visitor's recently-viewed history.
 *
 * A render-nothing client component so the PDP itself stays a Server Component:
 * only the write needs the browser, not the page. Runs after paint, so it never
 * delays the product appearing.
 */
export function RecordView({ product }: { product: ProductSummary }) {
  useEffect(() => {
    recordView(product);
  }, [product]);

  return null;
}
