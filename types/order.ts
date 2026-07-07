import type { Money } from "@/types/money";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

/**
 * An immutable snapshot of a purchased line.
 *
 * Fully denormalized on purpose: the order must remain complete and readable in
 * the Admin Panel forever — including product name, variant name, SKU and the
 * price paid — even if the product or variant is later changed or deleted.
 */
export interface OrderItem {
  readonly productId: string;
  readonly productName: string;
  readonly variantId: string;
  readonly variantName: string;
  readonly sku: string;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly lineTotal: Money;
}

export interface Order {
  readonly id: string;
  readonly items: readonly OrderItem[];
  readonly total: Money;
  readonly status: OrderStatus;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
}
