import type { Money } from "@/types/money";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

/** Aggregate counts shown on the dashboard stat cards. */
export interface DashboardStats {
  readonly totalProducts: number;
  readonly activeProducts: number;
  readonly totalOrders: number;
  readonly totalCustomers: number;
  readonly revenue: Money;
}

/** Compact order row for the "Recent Orders" table. */
export interface AdminOrderSummary {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly total: Money;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly createdAt: string;
}

/** Compact customer row for the "Latest Customers" list. */
export interface AdminCustomerSummary {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly createdAt: string;
}

/** A low-stock variant for the "Low Stock Products" list. */
export interface LowStockVariant {
  readonly variantId: string;
  readonly productName: string;
  readonly variantName: string;
  readonly sku: string;
  readonly stock: number;
}
