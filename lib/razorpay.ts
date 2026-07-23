import "server-only";

import crypto from "node:crypto";
import Razorpay from "razorpay";

/**
 * Server-only Razorpay gateway wrapper.
 *
 * Reads credentials from the environment (never hardcoded):
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID (public — handed to Razorpay Checkout in the
 *                                browser, and used server-side to init the SDK)
 *   RAZORPAY_KEY_SECRET         (SECRET — order creation, signature verification)
 *   RAZORPAY_WEBHOOK_SECRET     (SECRET — webhook signature verification)
 *   RAZORPAY_KEY_ID             (optional — a server-only alias for the key id;
 *                                falls back to NEXT_PUBLIC_RAZORPAY_KEY_ID)
 *
 * The key id is NOT a secret (Razorpay Checkout receives it in the browser), so
 * the server accepts it from either variable. That means the only variables that
 * must be set are NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (plus the
 * webhook secret for the backstop) — no separate server key id required.
 *
 * Everything is gated behind `isRazorpayConfigured()`, so the store cleanly
 * reports payments unavailable until the keys are provided — no code changes
 * needed to go live.
 */
const keyId = (process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "").trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET ?? "").trim();
const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET ?? "").trim();

/** Public key id for the browser Checkout widget. */
export const razorpayPublicKeyId = keyId;

export function isRazorpayConfigured(): boolean {
  return keyId.length > 0 && keySecret.length > 0;
}

let client: Razorpay | null = null;
function getClient(): Razorpay {
  if (!isRazorpayConfigured()) throw new Error("Razorpay is not configured.");
  if (!client) client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/** Create a Razorpay order for the given amount (integer paise). */
export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
  const order = await getClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    payment_capture: true,
  });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
}

/** Verify the checkout callback signature: HMAC_SHA256(order_id|payment_id, secret). */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
): boolean {
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Verify a webhook: HMAC_SHA256(rawBody, webhookSecret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!webhookSecret) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}
