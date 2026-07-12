"use server";

import { z } from "zod";

import { computeCheckoutTotals } from "@/lib/checkout";
import { createMoney } from "@/lib/money";
import {
  orderConfirmationEmail,
  paymentFailedEmail,
  paymentSuccessEmail,
  toOrderEmailData,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/service";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayPublicKeyId,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { orderService } from "@/services/order-service";
import type { CartItem } from "@/types/cart";
import type { CreateOrderInput, ShippingAddress } from "@/types/checkout";

const addressSchema = z.object({
  line1: z.string().trim().min(1),
  line2: z.string().trim().optional().default(""),
  landmark: z.string().trim().optional().default(""),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  pincode: z.string().trim().regex(/^\d{6}$/),
  country: z.string().trim().min(1).default("India"),
});

const createOrderSchema = z.object({
  contact: z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    mobile: z.string().trim().regex(/^[6-9]\d{9}$/),
  }),
  address: addressSchema,
  billingAddress: addressSchema.nullish(),
  billingSameAsShipping: z.boolean().default(true),
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["razorpay", "cod"]),
  lines: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Your cart is empty."),
  idempotencyKey: z.string().min(1).max(64),
});

export type CreateOrderActionInput = z.input<typeof createOrderSchema>;

export type CreateOrderActionResult =
  | { ok: false; error: string }
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      payment:
        | { provider: "cod" }
        | {
            provider: "razorpay";
            razorpayOrderId: string;
            amount: number;
            currency: string;
            keyId: string;
            prefill: { name: string; email: string; contact: string };
          };
    };

interface VariantRow {
  id: string;
  price: number;
  sku: string;
  variant_name: string;
  status: string;
  product: {
    id: string;
    name: string;
    slug: string;
    featured_image: string;
    active: boolean;
    deleted_at: string | null;
  } | null;
}

/**
 * Rebuild trusted cart lines from the live catalogue. Prices, names and images
 * come from the database — never from the client — so totals can't be tampered
 * with. Inactive / deleted / unknown variants are rejected.
 */
async function resolveLines(
  lines: { variantId: string; quantity: number }[],
): Promise<{ items: CartItem[] } | { error: string }> {
  const db = getSupabaseAdminClient();
  const variantIds = [...new Set(lines.map((line) => line.variantId))];

  const { data, error } = await db
    .from("product_variants")
    .select(
      "id, price, sku, variant_name, status, " +
        "product:products(id, name, slug, featured_image, active, deleted_at)",
    )
    .in("id", variantIds);
  if (error) throw error;

  const byId = new Map((data as unknown as VariantRow[]).map((row) => [row.id, row]));
  const items: CartItem[] = [];

  for (const line of lines) {
    const variant = byId.get(line.variantId);
    const product = variant?.product;
    if (!variant || variant.status !== "active" || !product || !product.active || product.deleted_at) {
      return { error: "One or more items are no longer available. Please review your cart." };
    }
    items.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      featuredImage: product.featured_image,
      variantId: variant.id,
      variantName: variant.variant_name,
      sku: variant.sku,
      unitPrice: createMoney(variant.price),
      quantity: line.quantity,
      subtotal: createMoney(variant.price * line.quantity),
    });
  }

  return { items };
}

function toShippingAddress(input: z.infer<typeof addressSchema>): ShippingAddress {
  return {
    line1: input.line1,
    line2: input.line2 || undefined,
    landmark: input.landmark || undefined,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    country: input.country,
  };
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Create an order (transactional persist + atomic inventory) and start payment.
 * COD orders are created pending; Razorpay orders return the gateway parameters
 * for the browser Checkout widget.
 */
export async function createOrderAction(
  raw: CreateOrderActionInput,
): Promise<CreateOrderActionResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }
  const input = parsed.data;

  if (input.paymentMethod === "razorpay" && !isRazorpayConfigured()) {
    return { ok: false, error: "Online payment is currently unavailable. Please choose Cash on Delivery." };
  }

  try {
    const resolved = await resolveLines(input.lines);
    if ("error" in resolved) return { ok: false, error: resolved.error };

    const totals = computeCheckoutTotals(resolved.items, input.deliveryMethod);

    // Link the order to the signed-in customer when present.
    const supabase = await createSupabaseServerClient();
    const { data: userData } = await supabase.auth.getUser();
    const profileId = userData.user?.id ?? null;

    const createInput: CreateOrderInput = {
      contact: input.contact,
      shippingAddress: toShippingAddress(input.address),
      billingAddress: input.billingAddress ? toShippingAddress(input.billingAddress) : null,
      billingSameAsShipping: input.billingSameAsShipping,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      items: resolved.items,
      totals,
      idempotencyKey: input.idempotencyKey,
      profileId,
    };

    const order = await orderService.createOrder(createInput);

    if (input.paymentMethod === "razorpay") {
      const rzpOrder = await createRazorpayOrder(order.total.amount, order.orderNumber);
      await orderService.attachRazorpayOrder(order.id, rzpOrder.id);
      return {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        payment: {
          provider: "razorpay",
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          keyId: razorpayPublicKeyId,
          prefill: {
            name: input.contact.fullName,
            email: input.contact.email,
            contact: input.contact.mobile,
          },
        },
      };
    }

    // COD — confirm the order immediately.
    await sendEmail(orderConfirmationEmail(toOrderEmailData(order)));
    return { ok: true, orderId: order.id, orderNumber: order.orderNumber, payment: { provider: "cod" } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}

export type VerifyPaymentResult =
  | { ok: false; error: string }
  | { ok: true; orderNumber: string };

/** Verify the Razorpay callback signature, settle the order, and email the customer. */
export async function verifyPaymentAction(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
  if (!input.orderId || !input.razorpayOrderId || !input.razorpayPaymentId || !input.signature) {
    return { ok: false, error: "Incomplete payment details." };
  }
  if (!verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.signature)) {
    return { ok: false, error: "Payment could not be verified. If you were charged, contact support." };
  }

  try {
    await orderService.confirmPayment(input.orderId, input.razorpayPaymentId, input.signature);
    const order = await orderService.getOrderById(input.orderId);
    if (order) {
      const data = toOrderEmailData(order);
      await sendEmail(paymentSuccessEmail(data));
      await sendEmail(orderConfirmationEmail(data));
      return { ok: true, orderNumber: order.orderNumber };
    }
    return { ok: false, error: "Order not found after payment." };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

/** Mark a Razorpay attempt failed (best-effort) and email the customer. */
export async function markPaymentFailedAction(orderId: string): Promise<void> {
  if (!orderId) return;
  try {
    await orderService.markPaymentFailed(orderId);
    const order = await orderService.getOrderById(orderId);
    if (order) await sendEmail(paymentFailedEmail(toOrderEmailData(order)));
  } catch {
    /* best-effort */
  }
}
