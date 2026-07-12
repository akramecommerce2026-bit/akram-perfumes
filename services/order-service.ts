import "server-only";

import type { OrderRepository } from "@/services/repositories/order-repository";
import { SupabaseOrderRepository } from "@/services/repositories/supabase-order-repository";
import type { CreateOrderInput, Order } from "@/types/checkout";

/**
 * Order write/read service consumed by the checkout server actions and the
 * customer confirmation/tracking pages. Depends only on the OrderRepository
 * abstraction; the production data source is Supabase (transactional RPCs).
 * Server-only — order writes use the RLS-bypassing service-role client.
 */
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  createOrder(input: CreateOrderInput): Promise<Order> {
    if (input.items.length === 0) {
      throw new Error("Cannot place an order with an empty cart.");
    }
    return this.repository.create(input);
  }

  getOrder(orderNumber: string): Promise<Order | null> {
    return this.repository.findByNumber(orderNumber);
  }

  getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    return this.repository.findByRazorpayOrderId(razorpayOrderId);
  }

  attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void> {
    return this.repository.attachRazorpayOrder(orderId, razorpayOrderId);
  }

  confirmPayment(orderId: string, paymentId: string, signature: string): Promise<void> {
    return this.repository.confirmPayment(orderId, paymentId, signature);
  }

  markPaymentFailed(orderId: string): Promise<void> {
    return this.repository.markPaymentFailed(orderId);
  }
}

export const orderService = new OrderService(new SupabaseOrderRepository());
