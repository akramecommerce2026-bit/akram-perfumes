import type { CustomerOrderTracking } from "@/types/shipment";

/**
 * Read contract for the customer-facing shipment tracking view. Keyed by the
 * public order number the customer holds. A future courier-API integration can
 * back this same interface without touching the storefront page.
 */
export interface OrderTrackingRepository {
  getByOrderNumber(orderNumber: string): Promise<CustomerOrderTracking | null>;
}
