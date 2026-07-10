"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import { adminOrderService } from "@/services/admin-order-service";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "@/services/repositories/admin-order-repository";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";
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
