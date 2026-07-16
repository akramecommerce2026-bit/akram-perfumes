import { addMoney, createMoney, multiplyMoney, sumMoney } from "@/lib/money";
import type { CartItem, CartTotals } from "@/types/cart";
import type { Money } from "@/types/money";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Pure, framework-agnostic cart helpers.
 *
 * All cart mutation and totalling logic lives here so it can back any cart
 * implementation (context today, Supabase-synced store tomorrow) without change.
 * The cart context is a thin stateful wrapper over these functions.
 */

/** The minimal product shape a cart line needs (snapshotted at add time). */
export type CartProductInput = Pick<Product, "id" | "name" | "slug" | "featuredImage">;

export function createCartItem(
  product: CartProductInput,
  variant: ProductVariant,
  quantity: number,
): CartItem {
  const safeQuantity = Math.max(1, Math.floor(quantity));
  return {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    featuredImage: product.featuredImage,
    variantId: variant.id,
    variantName: variant.variantName,
    sku: variant.sku,
    unitPrice: variant.price,
    quantity: safeQuantity,
    subtotal: multiplyMoney(variant.price, safeQuantity),
  };
}

/** Add a variant to the cart, merging with an existing line for that variant. */
export function addItemToCart(
  items: readonly CartItem[],
  product: CartProductInput,
  variant: ProductVariant,
  quantity: number,
): CartItem[] {
  const existing = items.find((item) => item.variantId === variant.id);
  if (existing) {
    return updateItemQuantity(items, variant.id, existing.quantity + quantity);
  }
  return [...items, createCartItem(product, variant, quantity)];
}

export function updateItemQuantity(
  items: readonly CartItem[],
  variantId: string,
  quantity: number,
): CartItem[] {
  const nextQuantity = Math.floor(quantity);
  if (nextQuantity <= 0) return removeItemFromCart(items, variantId);
  return items.map((item) =>
    item.variantId === variantId
      ? { ...item, quantity: nextQuantity, subtotal: multiplyMoney(item.unitPrice, nextQuantity) }
      : item,
  );
}

export function removeItemFromCart(items: readonly CartItem[], variantId: string): CartItem[] {
  return items.filter((item) => item.variantId !== variantId);
}

export function countCartItems(items: readonly CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateCartTotal(items: readonly CartItem[]): Money {
  return sumMoney(items.map((item) => item.subtotal));
}

export function computeCartTotals(items: readonly CartItem[]): CartTotals {
  const subtotal = calculateCartTotal(items);
  const { currency } = subtotal;

  // Delivery is free on every order; tax/discount remain V1 placeholders.
  const shipping = createMoney(0, currency);
  const tax = createMoney(0, currency);
  const discount = createMoney(0, currency);

  const total = addMoney(addMoney(subtotal, shipping), addMoney(tax, negate(discount)));

  return { subtotal, shipping, tax, discount, total };
}

function negate(value: Money): Money {
  return { amount: -value.amount, currency: value.currency };
}
