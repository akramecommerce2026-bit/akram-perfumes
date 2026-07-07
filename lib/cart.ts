import { multiplyMoney, sumMoney } from "@/lib/money";
import type { CartItem } from "@/types/cart";
import type { Money } from "@/types/money";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/types/variant";

/**
 * Pure helpers that turn a product + selected variant into a cart line and
 * compute totals. Framework-agnostic and state-free so they can back any future
 * cart implementation (context, store, or server) without change.
 */

export function createCartItem(
  product: Pick<Product, "id" | "name" | "slug" | "featuredImage">,
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

export function calculateCartTotal(items: readonly CartItem[]): Money {
  return sumMoney(items.map((item) => item.subtotal));
}
