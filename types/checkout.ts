import type { CartItem } from "@/types/cart";
import type { Money } from "@/types/money";

/** Delivery speeds offered at checkout. Extend the union to add new tiers. */
export type DeliveryMethodId = "standard" | "express";

/**
 * The project settles exclusively through Razorpay — a single method. Razorpay
 * Checkout handles UPI, cards, net banking and wallets internally, so there is
 * intentionally only one payment method in the domain.
 */
export type PaymentMethodId = "razorpay";

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

/**
 * Everything the customer entered at checkout, independent of the cart.
 * This is the shape a Supabase `orders` row / Razorpay order payload is built
 * from, so the future integration reads from here without touching the UI.
 */
export interface CheckoutDetails {
  readonly contact: ContactInfo;
  readonly address: ShippingAddress;
  readonly deliveryMethod: DeliveryMethodId;
  readonly paymentMethod: PaymentMethodId;
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

/** Input required to place an order (cart lines + entered checkout details). */
export interface PlaceOrderInput {
  readonly items: readonly CartItem[];
  readonly details: CheckoutDetails;
}
