import type { Money } from "@/types/money";

/**
 * A cart line item.
 *
 * Product and variant details are snapshotted at add-to-cart time (name, sku,
 * unit price) so the line stays correct and stable even if the underlying
 * product or variant is later edited or removed from the Admin Panel. The
 * selected variant always remains attached via `variantId` + snapshot.
 */
export interface CartItem {
  readonly productId: string;
  readonly productName: string;
  readonly productSlug: string;
  readonly featuredImage: string;
  readonly variantId: string;
  readonly variantName: string;
  readonly sku: string;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly subtotal: Money;
}

export interface Cart {
  readonly items: readonly CartItem[];
  readonly total: Money;
}

/** Order-summary breakdown. Shipping/tax/discount are placeholders for V1. */
export interface CartTotals {
  readonly subtotal: Money;
  readonly shipping: Money;
  readonly tax: Money;
  readonly discount: Money;
  readonly total: Money;
}
