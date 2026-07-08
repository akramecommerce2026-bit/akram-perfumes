"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  addItemToCart,
  computeCartTotals,
  countCartItems,
  removeItemFromCart,
  updateItemQuantity,
  type CartProductInput,
} from "@/lib/cart";
import type { CartItem, CartTotals } from "@/types/cart";
import type { Money } from "@/types/money";
import type { ProductVariant } from "@/types/variant";

const STORAGE_KEY = "akram-cart-v1";

interface CartState {
  items: CartItem[];
}

type CartActionType =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; product: CartProductInput; variant: ProductVariant; quantity: number }
  | { type: "setQuantity"; variantId: string; quantity: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function reducer(state: CartState, action: CartActionType): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add":
      return { items: addItemToCart(state.items, action.product, action.variant, action.quantity) };
    case "setQuantity":
      return { items: updateItemQuantity(state.items, action.variantId, action.quantity) };
    case "remove":
      return { items: removeItemFromCart(state.items, action.variantId) };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: readonly CartItem[];
  itemCount: number;
  subtotal: Money;
  totals: CartTotals;
  addItem: (product: CartProductInput, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Cart store. Persists to localStorage today (survives reloads + navigation);
 * the same reducer + action surface plugs into a Supabase-synced store later by
 * swapping only the hydrate/persist effects.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // Skips the initial persist so we never overwrite stored items with the empty
  // pre-hydration state on first mount.
  const skipPersist = useRef(true);

  // Hydrate from storage after mount (keeps SSR markup === first client render).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* ignore write failures (e.g. private mode quota) */
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: countCartItems(state.items),
      totals: computeCartTotals(state.items),
      subtotal: computeCartTotals(state.items).subtotal,
      addItem: (product, variant, quantity = 1) =>
        dispatch({ type: "add", product, variant, quantity }),
      updateQuantity: (variantId, quantity) =>
        dispatch({ type: "setQuantity", variantId, quantity }),
      removeItem: (variantId) => dispatch({ type: "remove", variantId }),
      clearCart: () => dispatch({ type: "clear" }),
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
    }),
    [state.items, isDrawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
