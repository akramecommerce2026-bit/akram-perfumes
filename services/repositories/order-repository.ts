import type { CreateOrderInput, Order } from "@/types/checkout";

/**
 * Data-access contract for orders.
 *
 * The order service depends on this interface, never a concrete data source.
 * The production implementation (`SupabaseOrderRepository`) persists every order
 * transactionally via the `place_order` RPC and settles payments via
 * `confirm_order_payment`.
 */
export interface OrderRepository {
  /** Create an order transactionally (customer + items + atomic stock decrement). */
  create(input: CreateOrderInput): Promise<Order>;
  findByNumber(orderNumber: string): Promise<Order | null>;
  findById(id: string): Promise<Order | null>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null>;
  /** Attach the gateway order id after creating a Razorpay order. */
  attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void>;
  /** Idempotently mark an order paid + advance its status + log the event. */
  confirmPayment(orderId: string, paymentId: string, signature: string): Promise<void>;
  markPaymentFailed(orderId: string): Promise<void>;
}
