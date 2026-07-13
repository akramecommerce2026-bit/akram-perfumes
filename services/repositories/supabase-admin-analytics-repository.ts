import "server-only";

import { buildDailySeries, buildMonthlySeries, type OrderPoint } from "@/lib/admin/analytics";
import { createMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ACTIVITY_LIMIT,
  BEST_SELLERS_LIMIT,
  RECENT_ORDERS_LIMIT,
  type AdminAnalyticsRepository,
} from "@/services/repositories/admin-analytics-repository";
import type {
  ActivityItem,
  AnalyticsDashboard,
  BestSellingProduct,
  CategoryRevenue,
  OverviewStats,
  RecentOrderRow,
  ResolvedRange,
  StatusCount,
} from "@/types/admin-analytics";
import type { PaymentStatus } from "@/types/checkout";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUSES, type ShipmentStatus } from "@/types/shipment";

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  contact_name: string;
  total: number;
  payment_status: string;
  shipment_status: string;
  created_at: string;
}

interface ItemRow {
  product_id: string | null;
  product_name: string;
  featured_image: string;
  quantity: number;
  line_total: number;
  product: { category_id: string | null; category: { id: string; name: string } | null } | null;
  order: { payment_status: string; created_at: string } | null;
}

interface CustomerRow {
  id: string;
  full_name: string;
  created_at: string;
}

interface EventRow {
  id: string;
  status: string | null;
  message: string;
  created_at: string;
  order: { order_number: string } | null;
}

/**
 * Supabase-backed analytics reads (service-role, server-only). Fetches the
 * needed rows in a few minimal-column queries (order-items are bounded to the
 * selected window + paid at the DB) and aggregates in memory — mirroring the
 * JS-aggregation pattern used elsewhere in the admin repositories.
 */
export class SupabaseAdminAnalyticsRepository implements AdminAnalyticsRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async getDashboard(range: ResolvedRange): Promise<AnalyticsDashboard> {
    // Resilient parallel load: a transient failure in one query degrades that
    // section to empty rather than failing the whole dashboard (so the fallback
    // error screen never appears for a partial backend hiccup).
    const [ordersR, itemsR, customersR, eventsR] = await Promise.allSettled([
      this.fetchOrders(),
      this.fetchItems(range),
      this.fetchCustomers(),
      this.fetchEvents(),
    ]);

    const orders = settled(ordersR, "orders");
    const items = settled(itemsR, "order items");
    const customers = settled(customersR, "customers");
    const events = settled(eventsR, "tracking events");

    return {
      range,
      overview: buildOverview(orders, customers),
      revenue: buildRevenue(orders),
      statusBreakdown: buildStatusBreakdown(orders, range),
      bestSellers: buildBestSellers(items),
      categoryRevenue: buildCategoryRevenue(items),
      customers: buildCustomerInsights(orders, customers, range),
      recentOrders: buildRecentOrders(orders),
      activity: buildActivity(orders, events, customers),
    };
  }

  private async fetchOrders(): Promise<OrderRow[]> {
    const { data, error } = await this.db
      .from("orders")
      .select("id, order_number, customer_id, contact_name, total, payment_status, shipment_status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderRow[];
  }

  private async fetchItems(range: ResolvedRange): Promise<ItemRow[]> {
    const { data, error } = await this.db
      .from("order_items")
      .select(
        "product_id, product_name, featured_image, quantity, line_total, " +
          "product:products(category_id, category:categories(id, name)), " +
          "order:orders!inner(payment_status, created_at)",
      )
      .eq("order.payment_status", "paid")
      .gte("order.created_at", range.fromISO)
      .lt("order.created_at", range.toISO);
    if (error) throw error;
    return (data ?? []) as unknown as ItemRow[];
  }

  private async fetchCustomers(): Promise<CustomerRow[]> {
    const { data, error } = await this.db.from("customers").select("id, full_name, created_at");
    if (error) throw error;
    return (data ?? []) as CustomerRow[];
  }

  private async fetchEvents(): Promise<EventRow[]> {
    const { data, error } = await this.db
      .from("order_tracking_events")
      .select("id, status, message, created_at, order:orders(order_number)")
      .order("created_at", { ascending: false })
      .limit(ACTIVITY_LIMIT);
    if (error) throw error;
    return (data ?? []) as unknown as EventRow[];
  }
}

// --- pure aggregation -------------------------------------------------------

/** Unwrap a settled fetch, degrading a failed query to an empty list. */
function settled<T>(result: PromiseSettledResult<T[]>, label: string): T[] {
  if (result.status === "fulfilled") return result.value;
  console.error(`[analytics] failed to load ${label}:`, result.reason);
  return [];
}

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function toOrderPoint(row: OrderRow): OrderPoint {
  return { createdAt: row.created_at, total: row.total, paid: row.payment_status === "paid" };
}

function inRange(iso: string, range: ResolvedRange): boolean {
  return iso >= range.fromISO && iso < range.toISO;
}

function buildOverview(orders: readonly OrderRow[], customers: readonly CustomerRow[]): OverviewStats {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let totalRevenue = 0;
  let paidCount = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;
  let ordersToday = 0;
  let ordersThisMonth = 0;

  const statusCounts = new Map<ShipmentStatus, number>();
  const ordersByCustomer = new Map<string, number>();

  for (const order of orders) {
    const created = new Date(order.created_at).getTime();
    const paid = order.payment_status === "paid";
    if (paid) {
      totalRevenue += order.total;
      paidCount += 1;
    }
    if (created >= todayStart) {
      ordersToday += 1;
      if (paid) todayRevenue += order.total;
    }
    if (created >= monthStart) {
      ordersThisMonth += 1;
      if (paid) monthRevenue += order.total;
    }
    const status = order.shipment_status as ShipmentStatus;
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    if (order.customer_id) {
      ordersByCustomer.set(order.customer_id, (ordersByCustomer.get(order.customer_id) ?? 0) + 1);
    }
  }

  const count = (s: ShipmentStatus) => statusCounts.get(s) ?? 0;
  const returningCustomers = [...ordersByCustomer.values()].filter((n) => n >= 2).length;
  const newCustomers = customers.filter((c) => new Date(c.created_at).getTime() >= monthStart).length;

  return {
    totalRevenue: createMoney(totalRevenue),
    todayRevenue: createMoney(todayRevenue),
    monthRevenue: createMoney(monthRevenue),
    ordersToday,
    ordersThisMonth,
    totalOrders: orders.length,
    averageOrderValue: createMoney(paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0),
    returningCustomers,
    newCustomers,
    conversionRate: null,
    pendingOrders: count("pending"),
    processingOrders: count("confirmed") + count("packed"),
    shippedOrders: count("shipped") + count("out_for_delivery"),
    deliveredOrders: count("delivered"),
    cancelledOrders: count("cancelled") + count("returned"),
  };
}

function buildRevenue(orders: readonly OrderRow[]) {
  const points = orders.map(toOrderPoint);
  return {
    last7Days: buildDailySeries(points, 7),
    last30Days: buildDailySeries(points, 30),
    last12Months: buildMonthlySeries(points, 12),
  };
}

function buildStatusBreakdown(orders: readonly OrderRow[], range: ResolvedRange): StatusCount[] {
  const counts = new Map<ShipmentStatus, number>();
  for (const order of orders) {
    if (!inRange(order.created_at, range)) continue;
    const status = order.shipment_status as ShipmentStatus;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return SHIPMENT_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

function buildBestSellers(items: readonly ItemRow[]): BestSellingProduct[] {
  const map = new Map<string, { name: string; image: string; units: number; revenue: number }>();
  for (const item of items) {
    const id = item.product_id ?? item.product_name;
    const entry = map.get(id) ?? { name: item.product_name, image: item.featured_image, units: 0, revenue: 0 };
    entry.units += item.quantity;
    entry.revenue += item.line_total;
    if (!entry.image && item.featured_image) entry.image = item.featured_image;
    map.set(id, entry);
  }
  return [...map.entries()]
    .map(([productId, v]) => ({
      productId,
      name: v.name,
      image: v.image,
      unitsSold: v.units,
      revenue: createMoney(v.revenue),
    }))
    .sort((a, b) => b.revenue.amount - a.revenue.amount)
    .slice(0, BEST_SELLERS_LIMIT);
}

function buildCategoryRevenue(items: readonly ItemRow[]): CategoryRevenue[] {
  const map = new Map<string, { name: string; revenue: number }>();
  for (const item of items) {
    const category = item.product?.category ?? null;
    const id = category?.id ?? "uncategorised";
    const name = category?.name ?? "Uncategorised";
    const entry = map.get(id) ?? { name, revenue: 0 };
    entry.revenue += item.line_total;
    map.set(id, entry);
  }
  return [...map.entries()]
    .map(([categoryId, v]) => ({ categoryId, name: v.name, revenue: createMoney(v.revenue) }))
    .sort((a, b) => b.revenue.amount - a.revenue.amount);
}

function buildCustomerInsights(
  orders: readonly OrderRow[],
  customers: readonly CustomerRow[],
  range: ResolvedRange,
) {
  const ordersByCustomer = new Map<string, number>();
  const payingCustomers = new Set<string>();
  let paidRevenue = 0;
  for (const order of orders) {
    if (order.customer_id) {
      ordersByCustomer.set(order.customer_id, (ordersByCustomer.get(order.customer_id) ?? 0) + 1);
    }
    if (order.payment_status === "paid") {
      paidRevenue += order.total;
      if (order.customer_id) payingCustomers.add(order.customer_id);
    }
  }

  const ordering = ordersByCustomer.size;
  const returning = [...ordersByCustomer.values()].filter((n) => n >= 2).length;
  const newCustomers = customers.filter((c) => inRange(c.created_at, range)).length;

  return {
    totalCustomers: customers.length,
    returningCustomers: returning,
    newCustomers,
    repeatPurchaseRate: ordering > 0 ? returning / ordering : 0,
    averageCustomerSpend: createMoney(
      payingCustomers.size > 0 ? Math.round(paidRevenue / payingCustomers.size) : 0,
    ),
  };
}

function buildRecentOrders(orders: readonly OrderRow[]): RecentOrderRow[] {
  return orders.slice(0, RECENT_ORDERS_LIMIT).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.contact_name,
    total: createMoney(order.total),
    paymentStatus: order.payment_status as PaymentStatus,
    shipmentStatus: order.shipment_status as ShipmentStatus,
    createdAt: order.created_at,
  }));
}

function buildActivity(
  orders: readonly OrderRow[],
  events: readonly EventRow[],
  customers: readonly CustomerRow[],
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const order of orders.slice(0, ACTIVITY_LIMIT)) {
    items.push({
      id: `order-${order.id}`,
      type: "order_created",
      title: `Order ${order.order_number} placed`,
      description: order.contact_name,
      at: order.created_at,
    });
  }

  for (const event of events) {
    const orderNumber = event.order?.order_number ?? "order";
    const delivered = event.status === "delivered";
    items.push({
      id: `event-${event.id}`,
      type: delivered ? "order_delivered" : "shipment_updated",
      title: delivered
        ? `Order ${orderNumber} delivered`
        : `Order ${orderNumber} — ${event.message}`,
      description: delivered
        ? "Shipment completed"
        : event.status
          ? `Shipment ${SHIPMENT_STATUS_LABELS[event.status as ShipmentStatus]}`
          : "Shipment updated",
      at: event.created_at,
    });
  }

  for (const customer of customers.slice(0, ACTIVITY_LIMIT)) {
    items.push({
      id: `customer-${customer.id}`,
      type: "customer_registered",
      title: "New customer registered",
      description: customer.full_name,
      at: customer.created_at,
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, ACTIVITY_LIMIT);
}
