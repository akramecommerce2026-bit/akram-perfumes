import type { PaymentStatus } from "@/types/checkout";
import type { Money } from "@/types/money";
import type { ShipmentStatus } from "@/types/shipment";

/** Date-filter presets for the analytics dashboard. */
export type AnalyticsPreset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

/** A resolved, concrete date window (half-open: [fromISO, toISO)). */
export interface ResolvedRange {
  readonly preset: AnalyticsPreset;
  readonly fromISO: string;
  readonly toISO: string;
  readonly label: string;
  /** yyyy-mm-dd bounds for the custom-range date inputs. */
  readonly fromDate: string;
  readonly toDate: string;
}

/** Fixed at-a-glance KPIs (all-time / natural periods — not scoped by the filter). */
export interface OverviewStats {
  readonly totalRevenue: Money;
  readonly todayRevenue: Money;
  readonly monthRevenue: Money;
  readonly ordersToday: number;
  readonly ordersThisMonth: number;
  readonly totalOrders: number;
  readonly averageOrderValue: Money;
  readonly returningCustomers: number;
  readonly newCustomers: number;
  /** null → not measurable without storefront traffic data (placeholder in UI). */
  readonly conversionRate: number | null;
  readonly pendingOrders: number;
  readonly processingOrders: number;
  readonly shippedOrders: number;
  readonly deliveredOrders: number;
  readonly cancelledOrders: number;
}

/** One point on a revenue time series. `revenue` is integer paise. */
export interface RevenuePoint {
  readonly key: string;
  readonly label: string;
  readonly revenue: number;
  readonly orders: number;
}

export interface RevenueSeries {
  readonly last7Days: readonly RevenuePoint[];
  readonly last30Days: readonly RevenuePoint[];
  readonly last12Months: readonly RevenuePoint[];
}

export interface StatusCount {
  readonly status: ShipmentStatus;
  readonly count: number;
}

export interface BestSellingProduct {
  readonly productId: string;
  readonly name: string;
  readonly image: string;
  readonly unitsSold: number;
  readonly revenue: Money;
}

export interface CategoryRevenue {
  readonly categoryId: string;
  readonly name: string;
  readonly revenue: Money;
}

export interface CustomerInsights {
  readonly totalCustomers: number;
  readonly returningCustomers: number;
  readonly newCustomers: number;
  /** Share of ordering customers who ordered more than once (0..1). */
  readonly repeatPurchaseRate: number;
  readonly averageCustomerSpend: Money;
}

export interface RecentOrderRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly total: Money;
  readonly paymentStatus: PaymentStatus;
  readonly shipmentStatus: ShipmentStatus;
  readonly createdAt: string;
}

export type ActivityType =
  | "order_created"
  | "shipment_updated"
  | "order_delivered"
  | "customer_registered";

export interface ActivityItem {
  readonly id: string;
  readonly type: ActivityType;
  readonly title: string;
  readonly description: string;
  readonly at: string;
}

/** The full analytics payload for one dashboard render. */
export interface AnalyticsDashboard {
  readonly range: ResolvedRange;
  readonly overview: OverviewStats;
  readonly revenue: RevenueSeries;
  readonly statusBreakdown: readonly StatusCount[];
  readonly bestSellers: readonly BestSellingProduct[];
  readonly categoryRevenue: readonly CategoryRevenue[];
  readonly customers: CustomerInsights;
  readonly recentOrders: readonly RecentOrderRow[];
  readonly activity: readonly ActivityItem[];
}
