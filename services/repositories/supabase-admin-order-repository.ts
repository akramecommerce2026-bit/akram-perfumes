import "server-only";

import { createMoney } from "@/lib/money";
import { buildTrackingTimeline } from "@/lib/shipment";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapShipmentRow, mapTrackingEventRow } from "@/lib/supabase/mappers";
import type { Tables, TablesUpdate } from "@/lib/supabase/database.types";
import {
  DEFAULT_ORDER_PAGE_SIZE,
  type AdminOrderRepository,
} from "@/services/repositories/admin-order-repository";
import type {
  AdminOrderDetail,
  AdminOrderLine,
  AdminOrderListItem,
  AdminOrderListResult,
  AdminOrderQuery,
} from "@/types/admin-order";
import type {
  DeliveryMethodId,
  OrderStatus,
  PaymentMethodId,
  PaymentStatus,
} from "@/types/checkout";
import type { ShipmentStatus, ShipmentUpdateInput } from "@/types/shipment";

const LIST_SELECT =
  "id, order_number, contact_name, contact_email, total, status, payment_status, " +
  "shipment_status, tracking_number, estimated_delivery, created_at, order_items(id)";

/**
 * Supabase-backed admin order repository (service-role, server-only). Read +
 * status transitions only. Money is stored as integer paise.
 */
export class SupabaseAdminOrderRepository implements AdminOrderRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async list(query: AdminOrderQuery): Promise<AdminOrderListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.pageSize ?? DEFAULT_ORDER_PAGE_SIZE;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let request = this.db.from("orders").select(LIST_SELECT, { count: "exact" });

    const term = query.search?.trim();
    if (term) {
      // Neutralize PostgREST filter metacharacters before interpolating into `.or()`.
      const safe = term.replace(/[%,()]/g, " ");
      request = request.or(`order_number.ilike.%${safe}%,contact_name.ilike.%${safe}%`);
    }
    if (query.status && query.status !== "all") request = request.eq("status", query.status);
    if (query.paymentStatus && query.paymentStatus !== "all") {
      request = request.eq("payment_status", query.paymentStatus);
    }
    if (query.shipmentStatus && query.shipmentStatus !== "all") {
      request = request.eq("shipment_status", query.shipmentStatus);
    }

    request = request.order("created_at", { ascending: query.sort === "oldest" }).range(from, to);

    const { data, count, error } = await request;
    if (error) throw error;

    const total = count ?? 0;
    return {
      items: ((data ?? []) as unknown as ListRow[]).map(mapListItem),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getById(id: string): Promise<AdminOrderDetail | null> {
    const { data: order, error } = await this.db
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;

    const [{ data: items, error: itemsError }, { data: events, error: eventsError }] =
      await Promise.all([
        this.db
          .from("order_items")
          .select("*")
          .eq("order_id", id)
          .order("created_at", { ascending: true }),
        this.db
          .from("order_tracking_events")
          .select("*")
          .eq("order_id", id)
          .order("created_at", { ascending: true }),
      ]);
    if (itemsError) throw itemsError;
    if (eventsError) throw eventsError;

    return mapDetail(order, items ?? [], events ?? []);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await this.db.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    const patch: TablesUpdate<"orders"> = { payment_status: paymentStatus };
    if (paymentStatus === "paid") patch.payment_timestamp = new Date().toISOString();
    const { error } = await this.db.from("orders").update(patch).eq("id", id);
    if (error) throw error;
  }

  async updateShipment(id: string, input: ShipmentUpdateInput): Promise<void> {
    const patch: TablesUpdate<"orders"> = {
      courier_partner: input.courierPartner.trim() || null,
      tracking_number: input.trackingNumber.trim() || null,
      tracking_url: input.trackingUrl.trim() || null,
      shipment_status: input.shipmentStatus,
      shipped_at: input.shippedAt || null,
      estimated_delivery: input.estimatedDelivery || null,
      shipping_notes: input.shippingNotes.trim() || null,
    };
    // Stamp fulfilment timestamps from the status when the admin hasn't set them.
    if (input.shipmentStatus === "shipped" && !input.shippedAt) {
      patch.shipped_at = new Date().toISOString();
    }
    if (input.shipmentStatus === "delivered") {
      patch.delivered_at = new Date().toISOString();
    }
    // The `orders_log_shipment_status` trigger appends a timeline event whenever
    // shipment_status actually changes — no manual event insert here.
    const { error } = await this.db.from("orders").update(patch).eq("id", id);
    if (error) throw error;
  }
}

interface ListRow {
  id: string;
  order_number: string;
  contact_name: string;
  contact_email: string;
  total: number;
  status: string;
  payment_status: string;
  shipment_status: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  order_items: { id: string }[];
}

function mapListItem(row: ListRow): AdminOrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.contact_name,
    customerEmail: row.contact_email,
    itemCount: row.order_items?.length ?? 0,
    total: createMoney(row.total),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    shipmentStatus: row.shipment_status as ShipmentStatus,
    trackingNumber: row.tracking_number ?? "",
    estimatedDelivery: row.estimated_delivery,
    createdAt: row.created_at,
  };
}

function mapLine(row: Tables<"order_items">): AdminOrderLine {
  return {
    id: row.id,
    productName: row.product_name,
    productSlug: row.product_slug,
    variantName: row.variant_name,
    sku: row.sku,
    featuredImage: row.featured_image,
    quantity: row.quantity,
    unitPrice: createMoney(row.unit_price),
    lineTotal: createMoney(row.line_total),
  };
}

function mapDetail(
  row: Tables<"orders">,
  items: readonly Tables<"order_items">[],
  events: readonly Tables<"order_tracking_events">[],
): AdminOrderDetail {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    paymentMethod: row.payment_method as PaymentMethodId,
    deliveryMethod: row.delivery_method as DeliveryMethodId,
    contact: { name: row.contact_name, email: row.contact_email, phone: row.contact_phone },
    shipping: {
      line1: row.ship_line1,
      line2: row.ship_line2 ?? "",
      landmark: row.ship_landmark ?? "",
      city: row.ship_city,
      state: row.ship_state,
      pincode: row.ship_pincode,
      country: row.ship_country,
    },
    items: items.map(mapLine),
    subtotal: createMoney(row.subtotal),
    shippingTotal: createMoney(row.shipping),
    tax: createMoney(row.tax),
    discount: createMoney(row.discount),
    total: createMoney(row.total),
    razorpayOrderId: row.razorpay_order_id ?? "",
    razorpayPaymentId: row.razorpay_payment_id ?? "",
    paymentTimestamp: row.payment_timestamp ?? "",
    shipment: mapShipmentRow(row),
    timeline: buildTrackingTimeline({
      createdAt: row.created_at,
      paymentStatus: row.payment_status as PaymentStatus,
      paymentTimestamp: row.payment_timestamp,
      events: events.map(mapTrackingEventRow),
    }),
  };
}
