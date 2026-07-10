"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck } from "lucide-react";

import { Field, Select, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { ShipmentStatusBadge } from "@/components/shipment/ShipmentStatusBadge";
import { useToast } from "@/components/admin/ui/toast";
import { updateShipmentAction } from "@/lib/admin/order-actions";
import type { ShipmentFormValues } from "@/lib/admin/shipment-schema";
import { SHIPMENT_STATUSES, SHIPMENT_STATUS_LABELS, type ShipmentTracking } from "@/types/shipment";

interface ShipmentTrackingControlProps {
  orderId: string;
  shipment: ShipmentTracking;
}

/** Date column / timestamp -> yyyy-mm-dd for a native date input. */
function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function ShipmentTrackingControl({ orderId, shipment }: ShipmentTrackingControlProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(shipment.shipmentStatus);
  const [courierPartner, setCourierPartner] = useState(shipment.courierPartner);
  const [trackingNumber, setTrackingNumber] = useState(shipment.trackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(shipment.trackingUrl);
  const [shippedAt, setShippedAt] = useState(toDateInput(shipment.shippedAt));
  const [estimatedDelivery, setEstimatedDelivery] = useState(toDateInput(shipment.estimatedDelivery));
  const [shippingNotes, setShippingNotes] = useState(shipment.shippingNotes);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const values: ShipmentFormValues = {
      shipmentStatus: status,
      courierPartner,
      trackingNumber,
      trackingUrl,
      shippedAt: shippedAt || null,
      estimatedDelivery: estimatedDelivery || null,
      shippingNotes,
    };
    startTransition(async () => {
      const result = await updateShipmentAction(orderId, values);
      if (result.ok) {
        toast({ title: "Shipment updated", variant: "success" });
        router.refresh();
      } else {
        toast({ title: "Update failed", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
          <Truck className="size-5 text-accent" aria-hidden="true" /> Shipment Tracking
        </h2>
        <ShipmentStatusBadge status={shipment.shipmentStatus} />
      </div>

      <Field label="Shipment status" htmlFor="shipment-status">
        <Select
          id="shipment-status"
          value={status}
          disabled={isPending}
          onChange={(e) => setStatus(e.target.value as ShipmentTracking["shipmentStatus"])}
        >
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SHIPMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Courier partner" htmlFor="courier-partner">
        <TextInput
          id="courier-partner"
          value={courierPartner}
          disabled={isPending}
          placeholder="e.g. Delhivery, Blue Dart"
          onChange={(e) => setCourierPartner(e.target.value)}
        />
      </Field>

      <Field label="Tracking number" htmlFor="tracking-number">
        <TextInput
          id="tracking-number"
          value={trackingNumber}
          disabled={isPending}
          placeholder="e.g. 1234567890"
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
      </Field>

      <Field label="Tracking URL" htmlFor="tracking-url" optional>
        <TextInput
          id="tracking-url"
          type="url"
          value={trackingUrl}
          disabled={isPending}
          placeholder="https://…"
          onChange={(e) => setTrackingUrl(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Shipping date" htmlFor="shipped-at" optional>
          <TextInput
            id="shipped-at"
            type="date"
            value={shippedAt}
            disabled={isPending}
            onChange={(e) => setShippedAt(e.target.value)}
          />
        </Field>
        <Field label="Estimated delivery" htmlFor="estimated-delivery" optional>
          <TextInput
            id="estimated-delivery"
            type="date"
            value={estimatedDelivery}
            disabled={isPending}
            onChange={(e) => setEstimatedDelivery(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Shipping notes" htmlFor="shipping-notes" optional>
        <Textarea
          id="shipping-notes"
          value={shippingNotes}
          disabled={isPending}
          placeholder="Internal notes about this shipment…"
          onChange={(e) => setShippingNotes(e.target.value)}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Save shipment
      </button>
    </form>
  );
}
