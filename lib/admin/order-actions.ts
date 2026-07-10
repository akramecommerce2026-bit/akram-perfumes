"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import { dispatchShipmentStatusEmail } from "@/lib/admin/shipment-emails";
import { shipmentSchema, type ShipmentFormValues } from "@/lib/admin/shipment-schema";
import { adminOrderService } from "@/services/admin-order-service";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/services/repositories/admin-order-repository";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";
import type { ShipmentUpdateInput } from "@/types/shipment";
import type { ActionResult } from "@/lib/admin/product-actions";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };
  try {
    await adminOrderService.updateStatus(id, status);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updatePaymentStatusAction(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<ActionResult> {
  await requireAdmin();
  if (!PAYMENT_STATUSES.includes(paymentStatus)) return { ok: false, error: "Invalid payment status." };
  try {
    await adminOrderService.updatePaymentStatus(id, paymentStatus);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateShipmentAction(
  id: string,
  values: ShipmentFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "No order specified." };

  const parsed = shipmentSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid shipment details." };
  }

  const input: ShipmentUpdateInput = {
    courierPartner: parsed.data.courierPartner,
    trackingNumber: parsed.data.trackingNumber,
    trackingUrl: parsed.data.trackingUrl,
    shipmentStatus: parsed.data.shipmentStatus,
    shippedAt: parsed.data.shippedAt || null,
    estimatedDelivery: parsed.data.estimatedDelivery || null,
    shippingNotes: parsed.data.shippingNotes,
  };

  try {
    // Read the order first so we can (a) detect a genuine status change and
    // (b) build the email payload from its contact + tracking details.
    const before = await adminOrderService.getById(id);
    if (!before) return { ok: false, error: "Order not found." };

    await adminOrderService.updateShipment(id, input);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    // The customer tracking page (keyed by order number) reflects the same data.
    revalidatePath("/track/[orderNumber]", "page");

    // Fire the matching notification hook only when the status actually changed.
    // Best-effort: a hook failure must never fail the shipment update itself.
    if (before.shipment.shipmentStatus !== input.shipmentStatus) {
      try {
        await dispatchShipmentStatusEmail(input.shipmentStatus, {
          orderNumber: before.orderNumber,
          customerName: before.contact.name,
          customerEmail: before.contact.email,
          trackingNumber: input.trackingNumber || undefined,
          trackingUrl: input.trackingUrl || undefined,
          estimatedDelivery: input.estimatedDelivery,
        });
      } catch {
        // Swallow: notification is non-critical to the update.
      }
    }

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
