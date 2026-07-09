import "server-only";

import { createMoney, sumMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOW_STOCK_THRESHOLD, type AdminRepository } from "@/services/repositories/admin-repository";
import type {
  AdminCustomerSummary,
  AdminOrderSummary,
  DashboardStats,
  LowStockVariant,
} from "@/types/admin";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

/**
 * Supabase-backed admin reads via the service-role client (RLS-bypassing).
 * Safe because every caller runs server-side inside the authenticated admin
 * area. Counts use head requests (no rows transferred) for efficiency.
 */
export class SupabaseAdminRepository implements AdminRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalProducts, activeProducts, totalOrders, totalCustomers, revenue] = await Promise.all([
      this.count("products"),
      this.countActiveProducts(),
      this.count("orders"),
      this.count("customers"),
      this.paidRevenue(),
    ]);

    return { totalProducts, activeProducts, totalOrders, totalCustomers, revenue };
  }

  async getRecentOrders(limit: number): Promise<readonly AdminOrderSummary[]> {
    const { data, error } = await this.db
      .from("orders")
      .select("id, order_number, contact_name, total, status, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.contact_name,
      total: createMoney(row.total),
      status: row.status as OrderStatus,
      paymentStatus: row.payment_status as PaymentStatus,
      createdAt: row.created_at,
    }));
  }

  async getLatestCustomers(limit: number): Promise<readonly AdminCustomerSummary[]> {
    const { data, error } = await this.db
      .from("customers")
      .select("id, full_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      createdAt: row.created_at,
    }));
  }

  async getLowStockProducts(limit: number): Promise<readonly LowStockVariant[]> {
    const { data, error } = await this.db
      .from("product_variants")
      .select("id, variant_name, sku, stock, product:products(name)")
      .eq("status", "active")
      .lte("stock", LOW_STOCK_THRESHOLD)
      .order("stock", { ascending: true })
      .limit(limit);
    if (error) throw error;

    return (data ?? []).map((row) => ({
      variantId: row.id,
      productName: row.product?.name ?? "Unknown product",
      variantName: row.variant_name,
      sku: row.sku,
      stock: row.stock,
    }));
  }

  // --- helpers ------------------------------------------------------------

  private async count(table: "products" | "orders" | "customers"): Promise<number> {
    const { count, error } = await this.db.from(table).select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }

  private async countActiveProducts(): Promise<number> {
    const { count, error } = await this.db
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("active", true);
    if (error) throw error;
    return count ?? 0;
  }

  private async paidRevenue() {
    const { data, error } = await this.db
      .from("orders")
      .select("total, currency")
      .eq("payment_status", "paid");
    if (error) throw error;
    if (!data || data.length === 0) return createMoney(0);
    return sumMoney(data.map((row) => createMoney(row.total)));
  }
}
