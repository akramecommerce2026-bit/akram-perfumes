"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface VariantSelection {
  readonly selectedVariantId: string;
  readonly setSelectedVariantId: (id: string) => void;
}

const VariantSelectionContext = createContext<VariantSelection | null>(null);

/**
 * Shares the selected variant between the two Product-page columns.
 *
 * The gallery (left) and the purchase panel (right) live in separate columns of
 * the page grid, so they cannot lift state through a common parent without one
 * client component wrapping the whole grid. This provider is that wrapper: it
 * holds the id, the purchase panel writes it, and the gallery reads it to swap
 * to the variant's own images — no navigation, no prop-drilling across columns.
 *
 * Renders only its children (no DOM node), so the grid layout is untouched.
 */
export function VariantSelectionProvider({
  initialVariantId,
  children,
}: {
  initialVariantId: string;
  children: ReactNode;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);
  const value = useMemo(
    () => ({ selectedVariantId, setSelectedVariantId }),
    [selectedVariantId],
  );
  return (
    <VariantSelectionContext.Provider value={value}>{children}</VariantSelectionContext.Provider>
  );
}

export function useVariantSelection(): VariantSelection {
  const context = useContext(VariantSelectionContext);
  if (!context) {
    throw new Error("useVariantSelection must be used within a VariantSelectionProvider");
  }
  return context;
}
