import "server-only";

import { createMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json, Tables } from "@/lib/supabase/database.types";
import type { OrderRepository } from "@/services/repositories/order-repository";
import type { CartItem } from "@/types/cart";
import type {
  CreateOrderInput,
  DeliveryMethodId,
  Order,
  OrderStatus,
  PaymentMethodId,
  PaymentStatus,
} from "@/types/checkout";

/**
 * Supabase-backed order repository. All writes run with the service-role admin
 * client (RLS-bypassing) so it must run server-side only.
 *
 * Order creation goes through the transactional `place_order` RPC — customer
 * upsert, order + items insert, atomic race-safe stock decrement and the initial
 * timeline event all commit or roll back together. Payment settlement goes
 * through the idempotent `confirm_order_payment` RPC.
 */
export class SupabaseOrderRepository implements OrderRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const billing = input.billingSameAsShipping ? null : input.billingAddress;
    const payload = {
      idempotency_key: input.idempotencyKey,
      profile_id: input.profileId ?? "",
      payment_method: input.paymentMethod,
      delivery_method: input.deliveryMethod,
      currency: input.totals.total.currency,
      subtotal: input.totals.subtotal.amount,
      shipping_fee: input.totals.shipping.amount,
      tax: input.totals.tax.amount,
      discount: input.totals.discount.amount,
      total: input.totals.total.amount,
      billing_same_as_shipping: input.billingSameAsShipping,
      contact: {
        name: input.contact.fullName,
        email: input.contact.email,
        phone: input.contact.mobile,
      },
      shipping: addressJson(input.shippingAddress),
      billing: billing ? { name: input.contact.fullName, ...addressJson(billing) } : {},
      items: input.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        product_slug: item.productSlug,
        variant_name: item.variantName,
        sku: item.sku,
        featured_image: item.featuredImage,
        unit_price: item.unitPrice.amount,
        quantity: item.quantity,
        line_total: item.subtotal.amount,
        currency: item.unitPrice.currency,
      })),
    };

    const { data, error } = await this.db.rpc("place_order", { payload: payload as unknown as Json });
    if (error) throw normalizeOrderError(error);

    const result = data as { order_id: string; order_number: string } | null;
    if (!result?.order_id) throw new Error("Order could not be created.");

    const order = await this.findById(result.order_id);
    if (!order) throw new Error("Order was created but could not be loaded.");
    return order;
  }

  async findByNumber(orderNumber: string): Promise<Order | null> {
    return this.loadOrder("order_number", orderNumber);
  }

  async findById(id: string): Promise<Order | null> {
    return this.loadOrder("id", id);
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    return this.loadOrder("razorpay_order_id", razorpayOrderId);
  }

  async attachRazorpayOrder(orderId: string, razorpayOrderId: string): Promise<void> {
    const { error } = await this.db
      .from("orders")
      .update({ razorpay_order_id: razorpayOrderId })
      .eq("id", orderId);
    if (error) throw error;
  }

  async confirmPayment(orderId: string, paymentId: string, signature: string): Promise<void> {
    const { error } = await this.db.rpc("confirm_order_payment", {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_signature: signature,
    });
    if (error) throw error;
  }

  async markPaymentFailed(orderId: string): Promise<void> {
    const { error } = await this.db
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId)
      .neq("payment_status", "paid");
    if (error) throw error;
  }

  private async loadOrder(column: "id" | "order_number" | "razorpay_order_id", value: string) {
    const { data: order, error } = await this.db
      .from("orders")
      .select("*")
      .eq(column, value)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;

    const { data: items, error: itemsError } = await this.db
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (itemsError) throw itemsError;

    return mapOrder(order, items ?? []);
  }
}

function addressJson(address: CreateOrderInput["shippingAddress"]) {
  return {
    line1: address.line1,
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
  };
}

/** Surface the RPC's out-of-stock signal as a friendly, typed error. */
function normalizeOrderError(error: { message: string }): Error {
  if (error.message.includes("INSUFFICIENT_STOCK")) {
    return new Error("One or more items are out of stock. Please review your cart and try again.");
  }
  return error instanceof Error ? error : new Error(error.message);
}

function mapOrderItem(row: Tables<"order_items">): CartItem {
  return {
    productId: row.product_id ?? "",
    productName: row.product_name,
    productSlug: row.product_slug,
    featuredImage: row.featured_image,
    variantId: row.variant_id ?? "",
    variantName: row.variant_name,
    sku: row.sku,
    unitPrice: createMoney(row.unit_price),
    quantity: row.quantity,
    subtotal: createMoney(row.line_total),
  };
}

function mapOrder(row: Tables<"orders">, items: readonly Tables<"order_items">[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    items: items.map(mapOrderItem),
    contact: {
      fullName: row.contact_name,
      email: row.contact_email,
      mobile: row.contact_phone,
    },
    address: {
      line1: row.ship_line1,
      line2: row.ship_line2 ?? undefined,
      landmark: row.ship_landmark ?? undefined,
      city: row.ship_city,
      state: row.ship_state,
      pincode: row.ship_pincode,
      country: row.ship_country,
    },
    deliveryMethod: row.delivery_method as DeliveryMethodId,
    paymentMethod: row.payment_method as PaymentMethodId,
    subtotal: createMoney(row.subtotal),
    shipping: createMoney(row.shipping),
    tax: createMoney(row.tax),
    discount: createMoney(row.discount),
    total: createMoney(row.total),
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    razorpayOrderId: row.razorpay_order_id ?? undefined,
    razorpayPaymentId: row.razorpay_payment_id ?? undefined,
    razorpaySignature: row.razorpay_signature ?? undefined,
    paymentTimestamp: row.payment_timestamp ?? undefined,
  };
}
