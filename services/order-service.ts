import { MockOrderRepository } from "@/services/repositories/mock-order-repository";
import type { OrderRepository } from "@/services/repositories/order-repository";
import type { Order, PlaceOrderInput } from "@/types/checkout";

/**
 * Order write/read service consumed by the checkout flow. Depends only on the
 * OrderRepository abstraction, so moving from the in-memory mock to Supabase
 * (and wiring Razorpay inside the repository's `create`) never touches this
 * file or the UI.
 */
export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    if (input.items.length === 0) {
      throw new Error("Cannot place an order with an empty cart");
    }
    return this.repository.create(input);
  }

  async getOrder(orderNumber: string): Promise<Order | null> {
    return this.repository.findByNumber(orderNumber);
  }
}

let instance: OrderRepository | null = null;

/**
 * Single point of control for the order data source. Today it returns the mock
 * repository; going live means returning a `SupabaseOrderRepository` here only.
 */
export function getOrderRepository(): OrderRepository {
  if (!instance) {
    instance = new MockOrderRepository();
  }
  return instance;
}

export const orderService = new OrderService(getOrderRepository());
