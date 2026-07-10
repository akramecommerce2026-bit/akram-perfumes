import "server-only";

import type { AdminCustomerRepository } from "@/services/repositories/admin-customer-repository";
import { SupabaseAdminCustomerRepository } from "@/services/repositories/supabase-admin-customer-repository";
import type {
  AdminCustomerDetail,
  AdminCustomerListResult,
  AdminCustomerQuery,
} from "@/types/admin-customer";

/**
 * Read + account-state service for admin customer management. Depends only on
 * the AdminCustomerRepository abstraction; consumed by admin Server Components
 * and server actions (server-only).
 */
export class AdminCustomerService {
  constructor(private readonly repository: AdminCustomerRepository) {}

  list(query: AdminCustomerQuery): Promise<AdminCustomerListResult> {
    return this.repository.list(query);
  }

  getById(id: string): Promise<AdminCustomerDetail | null> {
    return this.repository.getById(id);
  }

  setActive(id: string, active: boolean): Promise<void> {
    return this.repository.setActive(id, active);
  }

  softDelete(id: string): Promise<void> {
    return this.repository.softDelete(id);
  }

  restore(id: string): Promise<void> {
    return this.repository.restore(id);
  }
}

export const adminCustomerService = new AdminCustomerService(new SupabaseAdminCustomerRepository());
