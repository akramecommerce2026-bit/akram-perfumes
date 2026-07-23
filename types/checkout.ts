import type { CartItem, CartTotals } from "@/types/cart";
import type { Money } from "@/types/money";

/**
 * Delivery tier stored on an order. Every new order is `standard` (delivery is
 * free and no tier is offered); `express` only appears on historical orders.
 */
export type DeliveryMethodId = "standard" | "express";

/**
 * Payment method stored on an order. `razorpay` is the only method checkout
 * offers — Razorpay Checkout handles UPI, cards, net banking and wallets
 * internally. `cod` only appears on historical orders placed before online
 * payment became the sole option.
 */
export type PaymentMethodId = "razorpay" | "cod";

export interface ContactInfo {
  readonly fullName: string;
  readonly email: string;
  readonly mobile: string;
}

export interface ShippingAddress {
  readonly line1: string;
  readonly line2?: string;
  readonly landmark?: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly country: string;
}

/** Order lifecycle — mirrors the `order_status` enum in the database. */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Payment lifecycle — mirrors the `payment_status` enum in the database. */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/**
 * Razorpay settlement references attached to an order. All empty until the
 * payment phase verifies a Razorpay payment; present here so the domain and
 * database are ready with no further changes.
 */
export interface RazorpayPayment {
  readonly razorpayOrderId?: string;
  readonly razorpayPaymentId?: string;
  readonly razorpaySignature?: string;
  readonly paymentTimestamp?: string;
}

/**
 * A placed order. Payment fields are intentionally present but unsettled so the
 * Razorpay flow can later populate `paymentStatus` and the gateway references
 * without any schema change.
 */
export interface Order extends RazorpayPayment {
  readonly id: string;
  readonly orderNumber: string;
  readonly createdAt: string;
  readonly items: readonly CartItem[];
  readonly contact: ContactInfo;
  readonly address: ShippingAddress;
  readonly deliveryMethod: DeliveryMethodId;
  readonly paymentMethod: PaymentMethodId;
  readonly subtotal: Money;
  readonly shipping: Money;
  readonly tax: Money;
  readonly discount: Money;
  readonly total: Money;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
}

/**
 * Fully server-resolved order input passed to the repository. Prices and totals
 * here are recomputed on the server from the live catalogue (never trusted from
 * the client), and `idempotencyKey` dedupes double-submits / retries.
 */
export interface CreateOrderInput {
  readonly contact: ContactInfo;
  readonly shippingAddress: ShippingAddress;
  readonly billingAddress: ShippingAddress | null;
  readonly billingSameAsShipping: boolean;
  readonly deliveryMethod: DeliveryMethodId;
  readonly paymentMethod: PaymentMethodId;
  readonly items: readonly CartItem[];
  readonly totals: CartTotals;
  readonly idempotencyKey: string;
  readonly profileId: string | null;
}
