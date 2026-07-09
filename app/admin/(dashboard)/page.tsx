import { ActivityTimeline } from "@/components/admin/dashboard/ActivityTimeline";
import { LatestCustomers } from "@/components/admin/dashboard/LatestCustomers";
import { LowStockProducts } from "@/components/admin/dashboard/LowStockProducts";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { createMoney } from "@/lib/money";
import { adminService } from "@/services/admin-service";
import type {
  AdminCustomerSummary,
  AdminOrderSummary,
  DashboardStats,
  LowStockVariant,
} from "@/types/admin";

const EMPTY_STATS: DashboardStats = {
  totalProducts: 0,
  activeProducts: 0,
  totalOrders: 0,
  totalCustomers: 0,
  revenue: createMoney(0),
};

/**
 * Resilient parallel load. If a query fails (e.g. transient backend issue), the
 * dashboard still renders with safe defaults rather than erroring out.
 */
async function loadDashboard(): Promise<{
  stats: DashboardStats;
  recentOrders: readonly AdminOrderSummary[];
  latestCustomers: readonly AdminCustomerSummary[];
  lowStock: readonly LowStockVariant[];
}> {
  const [stats, recentOrders, latestCustomers, lowStock] = await Promise.all([
    adminService.getDashboardStats().catch(() => EMPTY_STATS),
    adminService.getRecentOrders().catch(() => []),
    adminService.getLatestCustomers().catch(() => []),
    adminService.getLowStockProducts().catch(() => []),
  ]);
  return { stats, recentOrders, latestCustomers, lowStock };
}

export default async function AdminDashboardPage() {
  const { stats, recentOrders, latestCustomers, lowStock } = await loadDashboard();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          An overview of your store&rsquo;s catalogue, orders and customers.
        </p>
      </header>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentOrders orders={recentOrders} />
        <LatestCustomers customers={latestCustomers} />
        <LowStockProducts items={lowStock} />
        <ActivityTimeline />
      </div>
    </div>
  );
}
