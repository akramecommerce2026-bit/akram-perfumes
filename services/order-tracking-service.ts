import "server-only";

import type { OrderTrackingRepository } from "@/services/repositories/order-tracking-repository";
import { SupabaseOrderTrackingRepository } from "@/services/repositories/supabase-order-tracking-repository";
import type { CustomerOrderTracking } from "@/types/shipment";

/**
 * Customer-facing shipment tracking read service. Depends only on the
 * OrderTrackingRepository abstraction; consumed by the storefront tracking page.
 */
export class OrderTrackingService {
  constructor(private readonly repository: OrderTrackingRepository) {}

  getByOrderNumber(orderNumber: string): Promise<CustomerOrderTracking | null> {
    return this.repository.getByOrderNumber(orderNumber);
  }
}

export const orderTrackingService = new OrderTrackingService(new SupabaseOrderTrackingRepository());
