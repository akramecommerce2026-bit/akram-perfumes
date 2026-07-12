import { formatMoney } from "@/lib/money";
import type { EmailMessage } from "@/lib/email/service";
import type { Order } from "@/types/checkout";

/** Minimal data every order email needs (kept serializable + decoupled from rows). */
export interface OrderEmailData {
  readonly orderNumber: string;
  readonly customerName: string;
  readonly email: string;
  readonly total: string;
  readonly paymentMethod: string;
  readonly trackingUrl?: string;
}

export function toOrderEmailData(order: Order, origin = "https://akramperfumes.com"): OrderEmailData {
  return {
    orderNumber: order.orderNumber,
    customerName: order.contact.fullName,
    email: order.contact.email,
    total: formatMoney(order.total),
    paymentMethod: order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
    trackingUrl: `${origin}/track/${encodeURIComponent(order.orderNumber)}`,
  };
}

function wrap(title: string, bodyLines: string[], data: OrderEmailData): EmailMessage {
  const greeting = `Hi ${data.customerName || "there"},`;
  const text = [greeting, "", ...bodyLines, "", data.trackingUrl ? `Track your order: ${data.trackingUrl}` : "", "— Akram Perfumes"]
    .filter((line) => line !== undefined)
    .join("\n");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px;letter-spacing:.15em;margin:0 0 4px">AKRAM PERFUMES</h1>
      <h2 style="font-size:16px;color:#7a5c12;margin:16px 0 8px">${title}</h2>
      <p>${greeting}</p>
      ${bodyLines.map((line) => `<p style="line-height:1.6">${line}</p>`).join("")}
      ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="color:#c8962a">Track your order →</a></p>` : ""}
      <p style="color:#888;font-size:13px;margin-top:24px">Order ${data.orderNumber} · ${data.total} · ${data.paymentMethod}</p>
    </div>`;
  return { to: data.email, subject: `${title} · Order ${data.orderNumber}`, html, text };
}

export function orderConfirmationEmail(data: OrderEmailData): EmailMessage {
  return wrap("Order Confirmed", [
    `Thank you for your order <strong>${data.orderNumber}</strong>. We've received it and will begin preparing your fragrances.`,
    `Order total: <strong>${data.total}</strong> · Payment: ${data.paymentMethod}.`,
  ], data);
}

export function paymentSuccessEmail(data: OrderEmailData): EmailMessage {
  return wrap("Payment Successful", [
    `We've received your payment of <strong>${data.total}</strong> for order <strong>${data.orderNumber}</strong>.`,
    `Your order is confirmed and will be packed shortly.`,
  ], data);
}

export function paymentFailedEmail(data: OrderEmailData): EmailMessage {
  return wrap("Payment Failed", [
    `Your payment for order <strong>${data.orderNumber}</strong> could not be completed.`,
    `No amount has been charged. You can retry payment from your order, or contact us for help.`,
  ], data);
}

export function shipmentCreatedEmail(data: OrderEmailData): EmailMessage {
  return wrap("Your Order Has Shipped", [
    `Good news — order <strong>${data.orderNumber}</strong> is on its way!`,
    `You can follow its journey using the tracking link below.`,
  ], data);
}

export function orderDeliveredEmail(data: OrderEmailData): EmailMessage {
  return wrap("Order Delivered", [
    `Order <strong>${data.orderNumber}</strong> has been delivered. We hope you love it!`,
    `Thank you for choosing Akram Perfumes.`,
  ], data);
}
