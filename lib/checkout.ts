import { calculateCartTotal } from "@/lib/cart";
import { addMoney, createMoney } from "@/lib/money";
import type { CartItem, CartTotals } from "@/types/cart";
import type { PaymentMethodId } from "@/types/checkout";
import type { Money } from "@/types/money";

/**
 * Checkout pricing + option catalogue.
 *
 * Payment options are declared as data (not hardcoded in the UI) so a new
 * gateway is added here in one place. Totals reuse the cart's subtotal logic —
 * no cart maths is duplicated — keeping a single source of truth for money.
 */

export interface PaymentOption {
  readonly id: PaymentMethodId;
  readonly name: string;
  readonly description: string;
}

/**
 * Payment methods. Razorpay Checkout handles every online method (UPI, cards,
 * net banking, wallets) internally, so it is the only gateway the store offers.
 */
export const PAYMENT_OPTIONS = [
  {
    id: "razorpay",
    name: "Secure Payment via Razorpay",
    description: "Pay by UPI, cards, net banking or wallets — all handled securely by Razorpay.",
  },
] as const satisfies readonly PaymentOption[];

/**
 * The methods checkout actually offers, narrower than `PaymentMethodId` (which
 * also covers `cod` on historical orders). Form + server validation derive from
 * this, so an order can never be created with a method the UI doesn't offer.
 */
export type OfferedPaymentMethodId = (typeof PAYMENT_OPTIONS)[number]["id"];

export const DEFAULT_PAYMENT_METHOD: OfferedPaymentMethodId = "razorpay";

/** True when the Razorpay public key is present (client + server safe). */
export function isRazorpayEnabled(): boolean {
  return Boolean((process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim());
}

/**
 * Order totals. Mirrors the cart's CartTotals shape (so the same CartTotals
 * component renders it). Delivery is free on every order; tax and discount stay
 * as V1 placeholders.
 */
export function computeCheckoutTotals(items: readonly CartItem[]): CartTotals {
  const subtotal = calculateCartTotal(items);
  const { currency } = subtotal;

  const shipping = createMoney(0, currency);
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
