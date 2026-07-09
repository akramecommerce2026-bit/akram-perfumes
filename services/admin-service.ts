import "server-only";

import { SupabaseAdminRepository } from "@/services/repositories/supabase-admin-repository";
import type { AdminRepository } from "@/services/repositories/admin-repository";
import type {
  AdminCustomerSummary,
  AdminOrderSummary,
  DashboardStats,
  LowStockVariant,
} from "@/types/admin";

/**
 * Read service for the Admin dashboard. Depends only on the AdminRepository
 * abstraction and is consumed exclusively by authenticated admin Server
 * Components — never by public/UI code (hence `server-only`).
 */
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  getDashboardStats(): Promise<DashboardStats> {
    return this.repository.getDashboardStats();
  }

  getRecentOrders(limit = 5): Promise<readonly AdminOrderSummary[]> {
    return this.repository.getRecentOrders(limit);
  }

  getLatestCustomers(limit = 5): Promise<readonly AdminCustomerSummary[]> {
    return this.repository.getLatestCustomers(limit);
  }

  getLowStockProducts(limit = 5): Promise<readonly LowStockVariant[]> {
    return this.repository.getLowStockProducts(limit);
  }
}

let instance: AdminRepository | null = null;

function getAdminRepository(): AdminRepository {
  if (!instance) {
    instance = new SupabaseAdminRepository();
  }
  return instance;
}

export const adminService = new AdminService(getAdminRepository());
