import { calculateCartTotal, FREE_SHIPPING_THRESHOLD } from "@/lib/cart";
import { addMoney, createMoney } from "@/lib/money";
import type { CartItem, CartTotals } from "@/types/cart";
import type { DeliveryMethodId, PaymentMethodId } from "@/types/checkout";
import type { Money } from "@/types/money";

/**
 * Checkout pricing + option catalogue.
 *
 * Delivery/payment options are declared as data (not hardcoded in the UI) so new
 * tiers or gateways are added here in one place. Totals reuse the cart's
 * subtotal logic — no cart maths is duplicated — and only layer delivery cost on
 * top, keeping a single source of truth for money.
 */

export interface DeliveryOption {
  readonly id: DeliveryMethodId;
  readonly name: string;
  readonly description: string;
  readonly estimate: string;
  /** Flat fee in paise. */
  readonly fee: number;
  /** When true, the fee is waived once the subtotal reaches the free-ship threshold. */
  readonly freeOverThreshold: boolean;
}

export const DELIVERY_OPTIONS: readonly DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Free on orders over ₹999",
    estimate: "3–5 business days",
    fee: 7900,
    freeOverThreshold: true,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Priority dispatch & tracking",
    estimate: "1–2 business days",
    fee: 14900,
    freeOverThreshold: false,
  },
];

export const DEFAULT_DELIVERY_METHOD: DeliveryMethodId = "standard";

export function getDeliveryOption(id: DeliveryMethodId): DeliveryOption {
  return DELIVERY_OPTIONS.find((option) => option.id === id) ?? DELIVERY_OPTIONS[0];
}

export interface PaymentOption {
  readonly id: PaymentMethodId;
  readonly name: string;
  readonly description: string;
}

/**
 * Payment methods. Razorpay Checkout handles every online method (UPI, cards,
 * net banking, wallets) internally; Cash on Delivery settles on arrival. The
 * Razorpay option is only offered when the gateway is configured
 * (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) — see `isRazorpayEnabled`.
 */
export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  {
    id: "razorpay",
    name: "Secure Payment via Razorpay",
    description: "Pay by UPI, cards, net banking or wallets — all handled securely by Razorpay.",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay in cash when your order is delivered.",
  },
];

/** True when the Razorpay public key is present (client + server safe). */
export function isRazorpayEnabled(): boolean {
  return Boolean((process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim());
}

/** Payment methods available to the customer, given the current configuration. */
export function availablePaymentMethods(): readonly PaymentOption[] {
  return PAYMENT_OPTIONS.filter((option) => option.id !== "razorpay" || isRazorpayEnabled());
}

/** Default method: Razorpay when configured, otherwise Cash on Delivery. */
export const DEFAULT_PAYMENT_METHOD: PaymentMethodId = "razorpay";

export function getDefaultPaymentMethod(): PaymentMethodId {
  return isRazorpayEnabled() ? "razorpay" : "cod";
}

/** Resolve the shipping fee for a subtotal + chosen delivery tier. */
export function resolveShippingFee(subtotalAmount: number, deliveryId: DeliveryMethodId): number {
  const option = getDeliveryOption(deliveryId);
  if (subtotalAmount === 0) return 0;
  if (option.freeOverThreshold && subtotalAmount >= FREE_SHIPPING_THRESHOLD) return 0;
  return option.fee;
}

/**
 * Delivery-aware order totals. Mirrors the cart's CartTotals shape (so the same
 * CartTotals component renders it) but shipping follows the selected tier.
 * Tax and discount stay as V1 placeholders.
 */
export function computeCheckoutTotals(
  items: readonly CartItem[],
  deliveryId: DeliveryMethodId,
): CartTotals {
  const subtotal = calculateCartTotal(items);
  const { currency } = subtotal;

  const shipping = createMoney(resolveShippingFee(subtotal.amount, deliveryId), currency);
  const tax = createMoney(0, currency);
  const discount = createMoney(0, currency);

  const total = addMoney(addMoney(subtotal, shipping), addMoney(tax, negate(discount)));

  return { subtotal, shipping, tax, discount, total };
}

function negate(value: Money): Money {
  return { amount: -value.amount, currency: value.currency };
}

/** Human-friendly, reasonably-unique order number, e.g. AKR-LZ4F9K-2X7. */
export function generateOrderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  const pick = (length: number) =>
    Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `AKR-${pick(6)}-${pick(3)}`;
}
