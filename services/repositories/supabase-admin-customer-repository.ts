import "server-only";

import { createMoney, formatMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/database.types";
import {
  DEFAULT_CUSTOMER_PAGE_SIZE,
  type AdminCustomerRepository,
} from "@/services/repositories/admin-customer-repository";
import type {
  AdminCustomerActivity,
  AdminCustomerAddress,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminCustomerListResult,
  AdminCustomerOrder,
  AdminCustomerQuery,
  AdminCustomerStats,
  AdminCustomerStatus,
} from "@/types/admin-customer";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

/** Order columns needed to aggregate per-customer stats in the directory. */
type OrderAggRow = Pick<Tables<"orders">, "customer_id" | "total" | "payment_status" | "created_at">;

/** One aggregated bucket of a customer's orders. */
interface OrderAgg {
  totalOrders: number;
  paidCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
}

/**
 * Supabase-backed admin customer repository (service-role, server-only).
 *
 * Reads customers and derives purchase statistics (orders, spend, last order)
 * from the `orders` table — mirroring how the category repository derives
 * product counts. Account state changes are activate/deactivate and reversible
 * soft-delete / restore; customers are never hard-deleted.
 */
export class SupabaseAdminCustomerRepository implements AdminCustomerRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async list(query: AdminCustomerQuery): Promise<AdminCustomerListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = query.pageSize ?? DEFAULT_CUSTOMER_PAGE_SIZE;

    // 1. Fetch every customer matching the status filter + search (no range yet:
    //    stats-based sorting needs the full matched set before pagination).
    let request = this.db
      .from("customers")
      .select("id, full_name, email, phone, active, deleted_at, created_at");

    switch (query.status) {
      case "active":
        request = request.eq("active", true).is("deleted_at", null);
        break;
      case "inactive":
        request = request.eq("active", false).is("deleted_at", null);
        break;
      case "deleted":
        request = request.not("deleted_at", "is", null);
        break;
      default: // "all" → every non-deleted customer
        request = request.is("deleted_at", null);
        break;
    }

    const term = query.search?.trim();
    if (term) {
      const safe = term.replace(/[%,()]/g, " ");
      request = request.or(
        `full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`,
      );
    }

    const { data: customers, error } = await request;
    if (error) throw error;

    const rows = (customers ?? []) as CustomerRow[];
    const aggregates = await this.aggregateOrders(rows.map((row) => row.id));

    // 2. Build list items with derived stats, then sort across the whole set.
    const items: AdminCustomerListItem[] = rows.map((row) => {
      const agg = aggregates.get(row.id);
      return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        totalOrders: agg?.totalOrders ?? 0,
        totalSpent: createMoney(agg?.totalSpent ?? 0),
        lastOrderAt: agg?.lastOrderAt ?? null,
        status: deriveStatus(row.active, row.deleted_at),
        createdAt: row.created_at,
      };
    });

    items.sort((a, b) => compareCustomers(a, b, query.sort ?? "recent"));

    // 3. Paginate the sorted set in memory.
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const clampedPage = Math.min(page, totalPages);
    const from = (clampedPage - 1) * pageSize;

    return {
      items: items.slice(from, from + pageSize),
      total,
      page: clampedPage,
      pageSize,
      totalPages,
    };
  }

  async getById(id: string): Promise<AdminCustomerDetail | null> {
    const { data: customer, error } = await this.db
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!customer) return null;

    const [{ data: addressRows, error: addrError }, { data: orderRows, error: orderError }] =
      await Promise.all([
        this.db
          .from("addresses")
          .select("*")
          .eq("customer_id", id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true }),
        this.db
          .from("orders")
          .select(
            "id, order_number, total, status, payment_status, payment_timestamp, created_at, order_items(id)",
          )
          .eq("customer_id", id)
          .order("created_at", { ascending: false }),
      ]);
    if (addrError) throw addrError;
    if (orderError) throw orderError;

    const orders = ((orderRows ?? []) as unknown as OrderDetailRow[]).map(mapOrder);
    const addresses = (addressRows ?? []).map(mapAddress);
    const stats = computeStats(orders);

    return {
      id: customer.id,
      fullName: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      status: deriveStatus(customer.active, customer.deleted_at),
      active: customer.active,
      deletedAt: customer.deleted_at,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      stats,
      addresses,
      orders,
      timeline: buildTimeline(customer, orders),
    };
  }

  async setActive(id: string, active: boolean): Promise<void> {
    const { error } = await this.db.from("customers").update({ active }).eq("id", id);
    if (error) throw error;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.db
      .from("customers")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", id);
    if (error) throw error;
  }

  async restore(id: string): Promise<void> {
    const { error } = await this.db
      .from("customers")
      .update({ deleted_at: null, active: true })
      .eq("id", id);
    if (error) throw error;
  }

  // --- helpers --------------------------------------------------------------

  /** Aggregate order stats for the given customer ids in a single query. */
  private async aggregateOrders(ids: readonly string[]): Promise<Map<string, OrderAgg>> {
    const result = new Map<string, OrderAgg>();
    if (ids.length === 0) return result;

    const { data, error } = await this.db
      .from("orders")
      .select("customer_id, total, payment_status, created_at")
      .in("customer_id", ids);
    if (error) throw error;

    for (const row of (data ?? []) as OrderAggRow[]) {
      if (!row.customer_id) continue;
      const agg =
        result.get(row.customer_id) ??
        { totalOrders: 0, paidCount: 0, totalSpent: 0, lastOrderAt: null, firstOrderAt: null };

      agg.totalOrders += 1;
      if (row.payment_status === "paid") {
        agg.paidCount += 1;
        agg.totalSpent += row.total;
      }
      if (!agg.lastOrderAt || row.created_at > agg.lastOrderAt) agg.lastOrderAt = row.created_at;
      if (!agg.firstOrderAt || row.created_at < agg.firstOrderAt) agg.firstOrderAt = row.created_at;

      result.set(row.customer_id, agg);
    }

    return result;
  }
}

type CustomerRow = Pick<
  Tables<"customers">,
  "id" | "full_name" | "email" | "phone" | "active" | "deleted_at" | "created_at"
>;

interface OrderDetailRow {
  id: string;
  order_number: string;
  total: number;
  status: string;
  payment_status: string;
  payment_timestamp: string | null;
  created_at: string;
  order_items: { id: string }[];
}

function deriveStatus(active: boolean, deletedAt: string | null): AdminCustomerStatus {
  if (deletedAt) return "deleted";
  return active ? "active" : "inactive";
}

function compareCustomers(
  a: AdminCustomerListItem,
  b: AdminCustomerListItem,
  sort: NonNullable<AdminCustomerQuery["sort"]>,
): number {
  switch (sort) {
    case "name":
      return a.fullName.localeCompare(b.fullName);
    case "spent":
      return b.totalSpent.amount - a.totalSpent.amount;
    case "orders":
      return b.totalOrders - a.totalOrders;
    default: // "recent" → newest join date first
      return b.createdAt.localeCompare(a.createdAt);
  }
}

function mapAddress(row: Tables<"addresses">): AdminCustomerAddress {
  return {
    id: row.id,
    line1: row.line1,
    line2: row.line2 ?? "",
    landmark: row.landmark ?? "",
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
    isDefault: row.is_default,
  };
}

function mapOrder(row: OrderDetailRow): AdminCustomerOrder & { paymentTimestamp: string | null } {
  return {
    id: row.id,
    orderNumber: row.order_number,
    itemCount: row.order_items?.length ?? 0,
    total: createMoney(row.total),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    createdAt: row.created_at,
    paymentTimestamp: row.payment_timestamp,
  };
}

type MappedOrder = ReturnType<typeof mapOrder>;

function computeStats(orders: readonly MappedOrder[]): AdminCustomerStats {
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const totalSpent = paid.reduce((sum, order) => sum + order.total.amount, 0);
  const timestamps = orders.map((order) => order.createdAt);

  return {
    totalOrders: orders.length,
    totalSpent: createMoney(totalSpent),
    averageOrderValue: createMoney(paid.length > 0 ? Math.round(totalSpent / paid.length) : 0),
    firstOrderAt: timestamps.length > 0 ? timestamps.reduce((a, b) => (a < b ? a : b)) : null,
    lastOrderAt: timestamps.length > 0 ? timestamps.reduce((a, b) => (a > b ? a : b)) : null,
  };
}

/** Build a reverse-chronological activity feed from account + order events. */
function buildTimeline(
  customer: Tables<"customers">,
  orders: readonly MappedOrder[],
): AdminCustomerActivity[] {
  const events: AdminCustomerActivity[] = [];

  events.push({
    id: "account-created",
    type: "account_created",
    title: "Account created",
    description: "Customer record was created.",
    at: customer.created_at,
  });

  for (const order of orders) {
    events.push({
      id: `order-placed-${order.id}`,
      type: "order_placed",
      title: `Order ${order.orderNumber} placed`,
      description: `${formatMoney(order.total)} · ${order.itemCount} item${order.itemCount === 1 ? "" : "s"}`,
      at: order.createdAt,
    });
    if (order.paymentStatus === "paid" && order.paymentTimestamp) {
      events.push({
        id: `order-paid-${order.id}`,
        type: "order_paid",
        title: `Payment received · ${order.orderNumber}`,
        description: `${formatMoney(order.total)} captured via Razorpay.`,
        at: order.paymentTimestamp,
      });
    }
  }

  if (customer.deleted_at) {
    events.push({
      id: "account-deleted",
      type: "deactivated",
      title: "Account soft-deleted",
      description: "Hidden from the active directory; can be restored.",
      at: customer.deleted_at,
    });
  } else if (!customer.active) {
    events.push({
      id: "account-deactivated",
      type: "deactivated",
      title: "Account deactivated",
      description: "Marked inactive by an admin.",
      at: customer.updated_at,
    });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at));
}
