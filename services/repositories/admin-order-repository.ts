import type { OrderStatus, PaymentStatus } from "@/types/checkout";
import type {
  AdminOrderDetail,
  AdminOrderListResult,
  AdminOrderQuery,
} from "@/types/admin-order";

/**
 * Read + status-write contract for admin order management. Orders are created
 * by the storefront checkout (Razorpay phase); the admin reads them and advances
 * their fulfilment/payment status — it never creates or deletes orders.
 */
export interface AdminOrderRepository {
  list(query: AdminOrderQuery): Promise<AdminOrderListResult>;
  getById(id: string): Promise<AdminOrderDetail | null>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void>;
}

export const DEFAULT_ORDER_PAGE_SIZE = 10;

/** Fulfilment lifecycle in order — drives the status dropdown + progress. */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_STATUSES: readonly PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
