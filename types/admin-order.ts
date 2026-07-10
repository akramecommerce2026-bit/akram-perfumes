import type { DeliveryMethodId, OrderStatus, PaymentMethodId, PaymentStatus } from "@/types/checkout";
import type { Money } from "@/types/money";

/** Row shape for the admin orders table. */
export interface AdminOrderListItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly itemCount: number;
  readonly total: Money;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly createdAt: string;
}

/** A line item within an order (denormalized snapshot). */
export interface AdminOrderLine {
  readonly id: string;
  readonly productName: string;
  readonly productSlug: string;
  readonly variantName: string;
  readonly sku: string;
  readonly featuredImage: string;
  readonly quantity: number;
  readonly unitPrice: Money;
  readonly lineTotal: Money;
}

/** Full order for the admin detail view. */
export interface AdminOrderDetail {
  readonly id: string;
  readonly orderNumber: string;
  readonly createdAt: string;
  readonly status: OrderStatus;
  readonly paymentStatus: PaymentStatus;
  readonly paymentMethod: PaymentMethodId;
  readonly deliveryMethod: DeliveryMethodId;
  readonly contact: { readonly name: string; readonly email: string; readonly phone: string };
  readonly shipping: {
    readonly line1: string;
    readonly line2: string;
    readonly landmark: string;
    readonly city: string;
    readonly state: string;
    readonly pincode: string;
    readonly country: string;
  };
  readonly items: readonly AdminOrderLine[];
  readonly subtotal: Money;
  readonly shippingTotal: Money;
  readonly tax: Money;
  readonly discount: Money;
  readonly total: Money;
  readonly razorpayOrderId: string;
  readonly razorpayPaymentId: string;
  readonly paymentTimestamp: string;
}

export interface AdminOrderQuery {
  readonly search?: string;
  readonly status?: OrderStatus | "all";
  readonly paymentStatus?: PaymentStatus | "all";
  readonly sort?: "newest" | "oldest";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface AdminOrderListResult {
  readonly items: readonly AdminOrderListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
