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

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { id: "razorpay", name: "Razorpay", description: "Cards, UPI, wallets & more" },
  { id: "upi", name: "UPI", description: "Google Pay, PhonePe, Paytm" },
  { id: "card", name: "Credit / Debit Card", description: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", name: "Net Banking", description: "All major Indian banks" },
];

export const DEFAULT_PAYMENT_METHOD: PaymentMethodId = "razorpay";

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
