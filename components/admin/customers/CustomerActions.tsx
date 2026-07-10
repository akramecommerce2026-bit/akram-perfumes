"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Loader2, RotateCcw, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/toast";
import {
  activateCustomerAction,
  deactivateCustomerAction,
  deleteCustomerAction,
  restoreCustomerAction,
} from "@/lib/admin/customer-actions";
import type { ActionResult } from "@/lib/admin/product-actions";
import type { AdminCustomerStatus } from "@/types/admin-customer";

interface CustomerActionsProps {
  customerId: string;
  status: AdminCustomerStatus;
}

const buttonBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60";

export function CustomerActions({ customerId, status }: CustomerActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast({ title: success, variant: "success" });
        setConfirmDelete(false);
        router.refresh();
      } else {
        toast({ title: "Action failed", description: result.error, variant: "error" });
        setConfirmDelete(false);
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Manage</h2>
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
      </div>

      {status === "deleted" ? (
        <>
          <p className="text-sm text-muted-foreground">
            This customer is soft-deleted. Their orders and history are preserved. Restore to make the
            account active again.
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() => run(() => restoreCustomerAction(customerId), "Customer restored")}
            className={`${buttonBase} bg-primary text-primary-foreground hover:shadow-gold`}
          >
            <RotateCcw className="size-4" aria-hidden="true" /> Restore customer
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {status === "active" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => deactivateCustomerAction(customerId), "Customer deactivated")}
              className={`${buttonBase} border border-border text-foreground hover:bg-muted`}
            >
              <Ban className="size-4" aria-hidden="true" /> Deactivate
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => activateCustomerAction(customerId), "Customer activated")}
              className={`${buttonBase} bg-primary text-primary-foreground hover:shadow-gold`}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" /> Activate
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmDelete(true)}
            className={`${buttonBase} text-destructive hover:bg-destructive/10`}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete customer
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="Delete this customer?"
        description="This is a soft delete — the record and all historical orders are preserved, and the customer can be restored at any time. They will be hidden from the active directory."
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={() => run(() => deleteCustomerAction(customerId), "Customer deleted")}
      />
    </section>
  );
}
