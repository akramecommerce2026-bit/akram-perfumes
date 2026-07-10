"use server";

import type {
  ShipmentEmailPayload,
  ShipmentEmailResult,
  ShipmentStatus,
} from "@/types/shipment";

/**
 * Reusable shipment notification hooks.
 *
 * These are the single integration point for transactional shipment emails.
 * No email provider is wired yet — each hook builds the message and records the
 * intent (server log). To go live, implement `deliver()` with a provider
 * (Resend / SES / Postmark, etc.); every call site and template stays unchanged.
 */

interface EmailTemplate {
  readonly subject: string;
  readonly body: string;
}

function trackingLine(payload: ShipmentEmailPayload): string {
  const parts: string[] = [];
  if (payload.trackingNumber) parts.push(`Tracking number: ${payload.trackingNumber}`);
  if (payload.trackingUrl) parts.push(`Track it here: ${payload.trackingUrl}`);
  if (payload.estimatedDelivery) parts.push(`Estimated delivery: ${payload.estimatedDelivery}`);
  return parts.length ? `\n\n${parts.join("\n")}` : "";
}

type EmailKind =
  | "order_confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

function buildTemplate(kind: EmailKind, payload: ShipmentEmailPayload): EmailTemplate {
  const { orderNumber, customerName } = payload;
  const hi = `Hi ${customerName || "there"},`;
  switch (kind) {
    case "order_confirmed":
      return {
        subject: `Your Akram Perfumes order ${orderNumber} is confirmed`,
        body: `${hi}\n\nThank you! We've confirmed your order ${orderNumber} and will begin preparing it shortly.`,
      };
    case "packed":
      return {
        subject: `Order ${orderNumber} is packed and ready to ship`,
        body: `${hi}\n\nGood news — your order ${orderNumber} has been carefully packed and is ready to be handed to the courier.`,
      };
    case "shipped":
      return {
        subject: `Your order ${orderNumber} has shipped`,
        body: `${hi}\n\nYour order ${orderNumber} is on its way!${trackingLine(payload)}`,
      };
    case "out_for_delivery":
      return {
        subject: `Order ${orderNumber} is out for delivery`,
        body: `${hi}\n\nYour order ${orderNumber} is out for delivery and should reach you today.${trackingLine(payload)}`,
      };
    case "delivered":
      return {
        subject: `Order ${orderNumber} has been delivered`,
        body: `${hi}\n\nYour order ${orderNumber} has been delivered. We hope you love it — thank you for choosing Akram Perfumes.`,
      };
  }
}

/**
 * Placeholder delivery. Swap the body for a real provider call when ready; the
 * signature and return contract are provider-agnostic on purpose.
 */
async function deliver(kind: EmailKind, payload: ShipmentEmailPayload): Promise<ShipmentEmailResult> {
  if (!payload.customerEmail) return { ok: false, error: "No recipient email." };
  const template = buildTemplate(kind, payload);
  console.info(`[shipment-email:${kind}] → ${payload.customerEmail} :: ${template.subject}`);
  return { ok: true };
}

export async function sendOrderConfirmedEmail(
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  return deliver("order_confirmed", payload);
}

export async function sendOrderPackedEmail(
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  return deliver("packed", payload);
}

export async function sendOrderShippedEmail(
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  return deliver("shipped", payload);
}

export async function sendOrderOutForDeliveryEmail(
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  return deliver("out_for_delivery", payload);
}

export async function sendOrderDeliveredEmail(
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  return deliver("delivered", payload);
}

/**
 * Route a shipment-status change to its notification hook. Statuses without a
 * customer email (pending / cancelled / returned) resolve as `skipped`.
 */
export async function dispatchShipmentStatusEmail(
  status: ShipmentStatus,
  payload: ShipmentEmailPayload,
): Promise<ShipmentEmailResult> {
  switch (status) {
    case "confirmed":
      return sendOrderConfirmedEmail(payload);
    case "packed":
      return sendOrderPackedEmail(payload);
    case "shipped":
      return sendOrderShippedEmail(payload);
    case "out_for_delivery":
      return sendOrderOutForDeliveryEmail(payload);
    case "delivered":
      return sendOrderDeliveredEmail(payload);
    default:
      return { ok: true, skipped: true };
  }
}
