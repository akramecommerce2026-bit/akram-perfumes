import "server-only";

import { computeCheckoutTotals, generateOrderNumber } from "@/lib/checkout";
import { createMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import type { OrderRepository } from "@/services/repositories/order-repository";
import type { CartItem } from "@/types/cart";
import type {
  DeliveryMethodId,
  Order,
  OrderStatus,
  PaymentStatus,
  PlaceOrderInput,
} from "@/types/checkout";

/**
 * Supabase-backed order repository. Writes with the service-role admin client
 * (RLS-bypassing) so it must run server-side only — hence `server-only`.
 *
 * PREPARED, NOT YET WIRED: order creation will be invoked from a server action
 * after Razorpay payment verification in the next phase. Until then the live
 * checkout flow uses the in-memory mock. Orders are created `pending` with empty
 * Razorpay references; the verification step later flips `payment_status`/status
 * and fills the gateway ids — no schema or architectural change required.
 */
export class SupabaseOrderRepository implements OrderRepository {
  private get db() {
    return getSupabaseAdminClient();
  }

  async create(input: PlaceOrderInput): Promise<Order> {
    const { items, details } = input;
    const totals = computeCheckoutTotals(items, details.deliveryMethod);

    const orderInsert: TablesInsert<"orders"> = {
      order_number: generateOrderNumber(),
      contact_name: details.contact.fullName,
      contact_email: details.contact.email,
      contact_phone: details.contact.mobile,
      ship_line1: details.address.line1,
      ship_line2: details.address.line2 ?? null,
      ship_landmark: details.address.landmark ?? null,
      ship_city: details.address.city,
      ship_state: details.address.state,
      ship_pincode: details.address.pincode,
      ship_country: details.address.country,
      delivery_method: details.deliveryMethod,
      subtotal: totals.subtotal.amount,
      shipping: totals.shipping.amount,
      tax: totals.tax.amount,
      discount: totals.discount.amount,
      total: totals.total.amount,
      currency: totals.total.currency,
      status: "pending",
      payment_status: "pending",
      payment_method: "razorpay",
    };

    const { data: order, error: orderError } = await this.db
      .from("orders")
      .insert(orderInsert)
      .select("*")
      .single();
    if (orderError) throw orderError;

    const itemsInsert: TablesInsert<"order_items">[] = items.map((item) => ({
      order_id: order.id,
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
    }));

    const { data: orderItems, error: itemsError } = await this.db
      .from("order_items")
      .insert(itemsInsert)
      .select("*");
    if (itemsError) throw itemsError;

    return mapOrder(order, orderItems ?? []);
  }

  async findByNumber(orderNumber: string): Promise<Order | null> {
    const { data: order, error } = await this.db
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw error;
    if (!order) return null;

    const { data: orderItems, error: itemsError } = await this.db
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    if (itemsError) throw itemsError;

    return mapOrder(order, orderItems ?? []);
  }
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
    paymentMethod: "razorpay",
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
