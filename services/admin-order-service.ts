import "server-only";

import type { AdminOrderRepository } from "@/services/repositories/admin-order-repository";
import { SupabaseAdminOrderRepository } from "@/services/repositories/supabase-admin-order-repository";
import type {
  AdminOrderDetail,
  AdminOrderListResult,
  AdminOrderQuery,
} from "@/types/admin-order";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

/**
 * Read + status-transition service for admin order management. Depends only on
 * the AdminOrderRepository abstraction; consumed by admin Server Components and
 * server actions (server-only).
 */
export class AdminOrderService {
  constructor(private readonly repository: AdminOrderRepository) {}

  list(query: AdminOrderQuery): Promise<AdminOrderListResult> {
    return this.repository.list(query);
  }

  getById(id: string): Promise<AdminOrderDetail | null> {
    return this.repository.getById(id);
  }

  updateStatus(id: string, status: OrderStatus): Promise<void> {
    return this.repository.updateStatus(id, status);
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
    return this.repository.updatePaymentStatus(id, paymentStatus);
  }
}

export const adminOrderService = new AdminOrderService(new SupabaseAdminOrderRepository());
