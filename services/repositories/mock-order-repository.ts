import { computeCheckoutTotals, generateOrderNumber } from "@/lib/checkout";
import type { OrderRepository } from "@/services/repositories/order-repository";
import type { Order, PlaceOrderInput } from "@/types/checkout";

/**
 * In-memory order store for V1. Persists nothing beyond the session, but keeps
 * the exact async surface a Supabase-backed repository will expose, so the swap
 * is a one-file change. Totals are recomputed here (never trusted from the
 * client) — the same guarantee a server/Supabase implementation must uphold.
 */
export class MockOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async create(input: PlaceOrderInput): Promise<Order> {
    const { items, details } = input;
    const totals = computeCheckoutTotals(items, details.deliveryMethod);

    const order: Order = {
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({ ...item })),
      contact: details.contact,
      address: details.address,
      deliveryMethod: details.deliveryMethod,
      paymentMethod: details.paymentMethod,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      status: "confirmed",
      // Unsettled until a real gateway (Razorpay) confirms payment.
      paymentStatus: "pending",
    };

    this.orders.set(order.orderNumber, order);
    return order;
  }

  async findByNumber(orderNumber: string): Promise<Order | null> {
    return this.orders.get(orderNumber) ?? null;
  }
}
