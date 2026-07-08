import type { CartItem } from "@/types/cart";
import type { Money } from "@/types/money";

/** Delivery speeds offered at checkout. Extend the union to add new tiers. */
export type DeliveryMethodId = "standard" | "express";

/** Payment methods shown at checkout (UI only for V1 — no gateway wired yet). */
export type PaymentMethodId = "razorpay" | "upi" | "card" | "netbanking";

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

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

/**
 * A placed order. Payment fields are intentionally present but unsettled so a
 * Razorpay flow can later populate `paymentStatus` / a gateway reference
 * without any schema change.
 */
export interface Order {
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
