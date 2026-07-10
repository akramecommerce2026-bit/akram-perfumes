import "server-only";

import { createMoney } from "@/lib/money";
import { buildTrackingTimeline } from "@/lib/shipment";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapShipmentRow, mapTrackingEventRow } from "@/lib/supabase/mappers";
import type { Tables } from "@/lib/supabase/database.types";
import type { OrderTrackingRepository } from "@/services/repositories/order-tracking-repository";
import type { PaymentStatus } from "@/types/checkout";
import type { CustomerOrderTracking } from "@/types/shipment";

/**
 * Supabase-backed shipment tracking read for the storefront. Uses the
 * service-role client (server-only) so a guest can look up their order by number
 * without auth — only non-PII shipment/timeline fields are surfaced to the page.
 * Order-number match is case-insensitive.
 */
export class SupabaseOrderTrackingRepository implements OrderTrackingRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async getByOrderNumber(orderNumber: string): Promise<CustomerOrderTracking | null> {
    const term = orderNumber.trim();
    if (!term) return null;

    const { data: order, error } = await this.db
      .from("orders")
      .select("*, order_items(id)")
      .ilike("order_number", term)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;

    const { data: events, error: eventsError } = await this.db
      .from("order_tracking_events")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (eventsError) throw eventsError;

    return mapTracking(order as OrderWithItems, events ?? []);
  }
}

type OrderWithItems = Tables<"orders"> & { order_items: { id: string }[] };

function mapTracking(
  order: OrderWithItems,
  events: readonly Tables<"order_tracking_events">[],
): CustomerOrderTracking {
  return {
    orderNumber: order.order_number,
    createdAt: order.created_at,
    paymentStatus: order.payment_status as PaymentStatus,
    itemCount: order.order_items?.length ?? 0,
    total: createMoney(order.total),
    tracking: mapShipmentRow(order),
    timeline: buildTrackingTimeline({
      createdAt: order.created_at,
      paymentStatus: order.payment_status as PaymentStatus,
      paymentTimestamp: order.payment_timestamp,
      events: events.map(mapTrackingEventRow),
    }),
  };
}
