import type { PaymentStatus } from "@/types/checkout";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_STATUSES,
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

  // Milestones can be stored as real events (checkout RPCs) OR synthesized from
  // order fields (older orders that predate stored events). Only synthesize a
  // milestone when it isn't already present in the stored events, so a
  // production order never shows a duplicated "Order Placed" / payment line.
  const storedMessages = new Set(source.events.map((event) => event.message.trim().toLowerCase()));

  if (!storedMessages.has("order placed")) {
    entries.push({
      id: "order-placed",
      type: "order_placed",
      status: null,
      title: "Order Placed",
      at: source.createdAt,
    });
  }

  if (
    source.paymentStatus === "paid" &&
    source.paymentTimestamp &&
    !storedMessages.has("payment confirmed") &&
    !storedMessages.has("payment successful")
  ) {
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

  // Chronological, with a logical tiebreak for milestones that share a timestamp
  // (payment confirmation and the resulting status change happen in one txn).
  return entries.sort((a, b) => a.at.localeCompare(b.at) || milestoneRank(a) - milestoneRank(b));
}

function milestoneRank(entry: TrackingTimelineEntry): number {
  if (entry.type === "order_placed") return 0;
  if (entry.type === "payment") return 1;
  if (entry.status === null) return 1; // stored milestone, e.g. "Payment Confirmed"
  return 2 + SHIPMENT_STATUSES.indexOf(entry.status);
}
