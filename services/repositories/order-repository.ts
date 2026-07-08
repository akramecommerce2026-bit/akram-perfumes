import type { Order, PlaceOrderInput } from "@/types/checkout";

/**
 * Data-access contract for orders (Dependency Inversion).
 *
 * The order service depends on this interface, never a concrete data source.
 * `MockOrderRepository` implements it today; a `SupabaseOrderRepository` (plus a
 * Razorpay call inside `create`) implements the same signature tomorrow with no
 * change to the service or UI.
 */
export interface OrderRepository {
  create(input: PlaceOrderInput): Promise<Order>;
  findByNumber(orderNumber: string): Promise<Order | null>;
}
