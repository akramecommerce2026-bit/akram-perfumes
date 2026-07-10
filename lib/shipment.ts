import type { PaymentStatus } from "@/types/checkout";
import {
  SHIPMENT_STATUS_LABELS,
  type ShipmentStatus,
  type TrackingEvent,
  type TrackingTimelineEntry,
} from "@/types/shipment";

/** Human label for a shipment status, e.g. "out_for_delivery" -> "Out For Delivery". */
export function shipmentStatusLabel(status: ShipmentStatus): string {
  return SHIPMENT_STATUS_LABELS[status];
}

interface TimelineSource {
  readonly createdAt: string;
  readonly paymentStatus: PaymentStatus;
  readonly paymentTimestamp: string | null;
  readonly events: readonly TrackingEvent[];
}

/**
 * Merge the synthetic account/payment milestones with the stored shipment events
 * into one chronological (oldest-first) timeline. Shared by the admin order
 * detail and the customer tracking page so both render an identical sequence.
 */
export function buildTrackingTimeline(source: TimelineSource): TrackingTimelineEntry[] {
  const entries: TrackingTimelineEntry[] = [];

  entries.push({
    id: "order-placed",
    type: "order_placed",
    status: null,
    title: "Order Placed",
    at: source.createdAt,
  });

  if (source.paymentStatus === "paid" && source.paymentTimestamp) {
    entries.push({
      id: "payment-successful",
      type: "payment",
      status: null,
      title: "Payment Successful",
      at: source.paymentTimestamp,
    });
  }

  for (const event of source.events) {
    entries.push({
      id: event.id,
      type: "shipment",
      status: event.status,
      title: event.message || (event.status ? shipmentStatusLabel(event.status) : "Update"),
      at: event.createdAt,
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}
