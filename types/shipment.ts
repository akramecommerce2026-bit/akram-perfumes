import type { PaymentStatus } from "@/types/checkout";
import type { Money } from "@/types/money";

/**
 * Manual shipment lifecycle — mirrors the `shipment_status` enum in the
 * database. A superset of the order lifecycle (adds out-for-delivery + returned)
 * so fulfilment tracking can evolve independently of the commercial order state.
 */
export type ShipmentStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

/** Ordered for the admin status dropdown + progress display. */
export const SHIPMENT_STATUSES: readonly ShipmentStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

/** Human labels for each shipment status (single source of truth in the app). */
export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** The manual shipment/courier details attached to an order. */
export interface ShipmentTracking {
  readonly courierPartner: string;
  readonly trackingNumber: string;
  readonly trackingUrl: string;
  readonly shipmentStatus: ShipmentStatus;
  readonly shippedAt: string | null;
  readonly estimatedDelivery: string | null;
  readonly deliveredAt: string | null;
  readonly shippingNotes: string;
}

/** A stored shipment timeline event (`order_tracking_events` row). */
export interface TrackingEvent {
  readonly id: string;
  readonly status: ShipmentStatus | null;
  readonly message: string;
  readonly createdAt: string;
}

export type TrackingTimelineType = "order_placed" | "payment" | "shipment";

/** A merged, presentation-ready timeline entry (synthetic + stored events). */
export interface TrackingTimelineEntry {
  readonly id: string;
  readonly type: TrackingTimelineType;
  readonly status: ShipmentStatus | null;
  readonly title: string;
  readonly at: string;
}

/** Values the admin submits from the Shipment Tracking form. */
export interface ShipmentUpdateInput {
  readonly courierPartner: string;
  readonly trackingNumber: string;
  readonly trackingUrl: string;
  readonly shipmentStatus: ShipmentStatus;
  readonly shippedAt: string | null;
  readonly estimatedDelivery: string | null;
  readonly shippingNotes: string;
}

/** Data a shipment notification email needs. Serializable (crosses the RSC boundary). */
export interface ShipmentEmailPayload {
  readonly orderNumber: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly trackingNumber?: string;
  readonly trackingUrl?: string;
  readonly estimatedDelivery?: string | null;
}

/** Result of a shipment email hook. `skipped` = no email defined for that status. */
export interface ShipmentEmailResult {
  readonly ok: boolean;
  readonly skipped?: boolean;
  readonly error?: string;
}

/** Customer-facing tracking payload for the storefront order page. */
export interface CustomerOrderTracking {
  readonly orderNumber: string;
  readonly createdAt: string;
  readonly paymentStatus: PaymentStatus;
  readonly itemCount: number;
  readonly total: Money;
  readonly tracking: ShipmentTracking;
  readonly timeline: readonly TrackingTimelineEntry[];
}
