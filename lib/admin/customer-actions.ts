"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import type { ActionResult } from "@/lib/admin/product-actions";
import { adminCustomerService } from "@/services/admin-customer-service";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function revalidateCustomer(id: string) {
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
}

async function mutate(
  id: string,
  run: () => Promise<void>,
): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "No customer specified." };
  try {
    await run();
    revalidateCustomer(id);
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function activateCustomerAction(id: string): Promise<ActionResult> {
  return mutate(id, () => adminCustomerService.setActive(id, true));
}

export async function deactivateCustomerAction(id: string): Promise<ActionResult> {
  return mutate(id, () => adminCustomerService.setActive(id, false));
}

/** Soft delete — the record and its historical orders are always preserved. */
export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  return mutate(id, () => adminCustomerService.softDelete(id));
}

export async function restoreCustomerAction(id: string): Promise<ActionResult> {
  return mutate(id, () => adminCustomerService.restore(id));
}
