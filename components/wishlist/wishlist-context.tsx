"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import type { ProductSummary } from "@/types/product";

const STORAGE_KEY = "akram-wishlist-v1";

type WishlistAction =
  | { type: "hydrate"; items: ProductSummary[] }
  | { type: "add"; product: ProductSummary }
  | { type: "remove"; productId: string }
  | { type: "toggle"; product: ProductSummary }
  | { type: "clear" };

function reducer(state: ProductSummary[], action: WishlistAction): ProductSummary[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add":
      return state.some((item) => item.id === action.product.id) ? state : [action.product, ...state];
    case "remove":
      return state.filter((item) => item.id !== action.productId);
    case "toggle":
      return state.some((item) => item.id === action.product.id)
        ? state.filter((item) => item.id !== action.product.id)
        : [action.product, ...state];
    case "clear":
      return [];
    default:
      return state;
  }
}

interface WishlistContextValue {
  items: readonly ProductSummary[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: ProductSummary) => void;
  add: (product: ProductSummary) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/**
 * Wishlist store. Persists to localStorage so it survives reloads and navigation
 * and is shared by guest + signed-in sessions on the same device — so a guest's
 * wishlist is naturally retained (merged) after they log in. Uses a reducer so
 * hydration/persistence run through dispatch (the same pattern as the cart).
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const skipPersist = useRef(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProductSummary[];
        if (Array.isArray(parsed)) dispatch({ type: "hydrate", items: parsed });
      }
    } catch {
      /* ignore unreadable/corrupt storage */
    }
  }, []);

  useEffect(() => {
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore write failures (private mode / quota) */
    }
  }, [items]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has: (productId) => items.some((item) => item.id === productId),
      toggle: (product) => dispatch({ type: "toggle", product }),
      add: (product) => dispatch({ type: "add", product }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
