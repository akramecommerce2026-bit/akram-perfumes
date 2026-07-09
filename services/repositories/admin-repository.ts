import type {
  AdminCustomerSummary,
  AdminOrderSummary,
  DashboardStats,
  LowStockVariant,
} from "@/types/admin";

/**
 * Data-access contract for the Admin dashboard (Dependency Inversion).
 *
 * The admin service depends on this interface, never a concrete data source, so
 * the read models can move (e.g. to materialized views or an analytics store)
 * without touching the service or UI. Implemented today by the Supabase-backed
 * repository using the service-role client behind the authenticated admin area.
 */
export interface AdminRepository {
  getDashboardStats(): Promise<DashboardStats>;
  getRecentOrders(limit: number): Promise<readonly AdminOrderSummary[]>;
  getLatestCustomers(limit: number): Promise<readonly AdminCustomerSummary[]>;
  getLowStockProducts(limit: number): Promise<readonly LowStockVariant[]>;
}

/** A variant at or below this stock level is considered low stock. */
export const LOW_STOCK_THRESHOLD = 15;
