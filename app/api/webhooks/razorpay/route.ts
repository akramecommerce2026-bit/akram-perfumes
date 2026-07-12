import { NextResponse } from "next/server";

import { verifyWebhookSignature } from "@/lib/razorpay";
import { orderService } from "@/services/order-service";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — a reliable backstop to the browser callback. Verifies the
 * signature, then settles / fails the matching order idempotently (so a
 * duplicate webhook, or one racing the client callback, is a harmless no-op).
 * Configure it in the Razorpay dashboard with RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const entity = event.payload?.payment?.entity;
    const razorpayOrderId = entity?.order_id;
    const paymentId = entity?.id;

    if (razorpayOrderId) {
      const order = await orderService.getOrderByRazorpayOrderId(razorpayOrderId);
      if (order) {
        if (event.event === "payment.captured" && paymentId) {
          await orderService.confirmPayment(order.id, paymentId, "webhook");
        } else if (event.event === "payment.failed") {
          await orderService.markPaymentFailed(order.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
