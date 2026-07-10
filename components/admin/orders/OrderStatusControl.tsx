"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Field, Select } from "@/components/admin/ui/form-fields";
import { useToast } from "@/components/admin/ui/toast";
import {
  updateOrderStatusAction,
  updatePaymentStatusAction,
} from "@/lib/admin/order-actions";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/services/repositories/admin-order-repository";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

interface OrderStatusControlProps {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

export function OrderStatusControl({ orderId, status, paymentStatus }: OrderStatusControlProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast({ title: success, variant: "success" });
        router.refresh();
      } else {
        toast({ title: "Update failed", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Manage</h2>
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
      </div>

      <Field label="Order status" htmlFor="order-status">
        <Select
          id="order-status"
          defaultValue={status}
          disabled={isPending}
          className="capitalize"
          onChange={(e) =>
            run(() => updateOrderStatusAction(orderId, e.target.value as OrderStatus), "Order status updated")
          }
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Payment status" htmlFor="payment-status">
        <Select
          id="payment-status"
          defaultValue={paymentStatus}
          disabled={isPending}
          className="capitalize"
          onChange={(e) =>
            run(
              () => updatePaymentStatusAction(orderId, e.target.value as PaymentStatus),
              "Payment status updated",
            )
          }
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
