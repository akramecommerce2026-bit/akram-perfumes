import type {
  AdminCustomerDetail,
  AdminCustomerListResult,
  AdminCustomerQuery,
  AdminCustomerSort,
  AdminCustomerStatusFilter,
} from "@/types/admin-customer";

/**
 * Read + account-state contract for admin customer management. Customers are
 * created by the storefront checkout (or backfilled from guest orders); the
 * admin reads them, toggles their active state and soft-deletes / restores.
 *
 * It NEVER hard-deletes: historical orders reference customer_id, so removal is
 * always a reversible `deleted_at` soft delete.
 */
export interface AdminCustomerRepository {
  list(query: AdminCustomerQuery): Promise<AdminCustomerListResult>;
  getById(id: string): Promise<AdminCustomerDetail | null>;
  setActive(id: string, active: boolean): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export const DEFAULT_CUSTOMER_PAGE_SIZE = 10;

/** Status filter values offered in the directory. */
export const CUSTOMER_STATUS_FILTERS: readonly AdminCustomerStatusFilter[] = [
  "all",
  "active",
  "inactive",
  "deleted",
];

/** Sort options offered in the directory. */
export const CUSTOMER_SORTS: readonly AdminCustomerSort[] = ["recent", "name", "spent", "orders"];
