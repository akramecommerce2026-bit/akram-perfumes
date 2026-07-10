import type { OrderStatus, PaymentStatus } from "@/types/checkout";
import type { Money } from "@/types/money";

/**
 * Account state shown in the admin. `deleted` is a soft delete — the row and
 * its historical orders are preserved and the customer can be restored.
 */
export type AdminCustomerStatus = "active" | "inactive" | "deleted";

/** Row shape for the admin customers directory. */
export interface AdminCustomerListItem {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly totalOrders: number;
  readonly totalSpent: Money;
  readonly lastOrderAt: string | null;
  readonly status: AdminCustomerStatus;
  readonly createdAt: string;
}

/** Aggregate purchase statistics for a single customer. */
export interface AdminCustomerStats {
  readonly totalOrders: number;
  /** Sum of orders whose payment was captured (paid). */
  readonly totalSpent: Money;
  readonly averageOrderValue: Money;
  readonly firstOrderAt: string | null;
  readonly lastOrderAt: string | null;
}

/** A saved address on the customer's account. */
export interface AdminCustomerAddress {
  readonly id: string;
  readonly line1: string;
  readonly line2: string;
  readonly landmark: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly country: string;
  readonly isDefault: boolean;
}

/** One row of the customer's order history. */
export interface AdminCustomerOrder {
  readonly id: string;
  readonly orderNumber: string;
  readonly itemCount: number;
  readonly total: Money;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly createdAt: string;
}

export type ActivityEventType = "account_created" | "order_placed" | "order_paid" | "deactivated";

/** A single entry on the customer's activity timeline. */
export interface AdminCustomerActivity {
  readonly id: string;
  readonly type: ActivityEventType;
  readonly title: string;
  readonly description: string;
  readonly at: string;
}

/** Full customer for the admin detail view. */
export interface AdminCustomerDetail {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly status: AdminCustomerStatus;
  readonly active: boolean;
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stats: AdminCustomerStats;
  readonly addresses: readonly AdminCustomerAddress[];
  readonly orders: readonly AdminCustomerOrder[];
  readonly timeline: readonly AdminCustomerActivity[];
}

export type AdminCustomerSort = "recent" | "name" | "spent" | "orders";
export type AdminCustomerStatusFilter = AdminCustomerStatus | "all";

export interface AdminCustomerQuery {
  readonly search?: string;
  readonly status?: AdminCustomerStatusFilter;
  readonly sort?: AdminCustomerSort;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AdminCustomerListResult {
  readonly items: readonly AdminCustomerListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
