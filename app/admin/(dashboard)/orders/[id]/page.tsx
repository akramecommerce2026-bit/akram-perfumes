import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderStatusControl } from "@/components/admin/orders/OrderStatusControl";
import { ShipmentTrackingControl } from "@/components/admin/orders/ShipmentTrackingControl";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/StatusBadge";
import { ShipmentStatusBadge } from "@/components/shipment/ShipmentStatusBadge";
import { TrackingTimeline } from "@/components/shipment/TrackingTimeline";
import { formatMoney } from "@/lib/money";
import { adminOrderService } from "@/services/admin-order-service";
import type { Money } from "@/types/money";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await adminOrderService.getById(id);
  if (!order) notFound();

  const addressLines = [
    order.shipping.line1,
    order.shipping.line2,
    order.shipping.landmark,
    `${order.shipping.city}, ${order.shipping.state} ${order.shipping.pincode}`,
    order.shipping.country,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            aria-label="Back to orders"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          <ShipmentStatusBadge status={order.shipment.shipmentStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex flex-col gap-6">
          {/* Items */}
          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <header className="border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Items ({order.items.length})
              </h2>
            </header>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                    {item.featuredImage ? (
                      <Image src={item.featuredImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{item.productName}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.variantName} · {item.sku} · Qty {item.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{formatMoney(item.lineTotal)}</div>
                    <div className="text-xs text-muted-foreground">{formatMoney(item.unitPrice)} each</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Customer + shipping */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-base font-semibold text-foreground">Customer</h2>
              <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{order.contact.name}</span>
                <span>{order.contact.email}</span>
                <span>{order.contact.phone}</span>
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-3 font-heading text-base font-semibold text-foreground">Shipping address</h2>
              <address className="flex flex-col gap-0.5 text-sm text-muted-foreground not-italic">
                {addressLines.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </address>
            </section>
          </div>

          {/* Tracking timeline */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Tracking timeline</h2>
            <TrackingTimeline
              timeline={order.timeline}
              emptyMessage="No tracking updates yet. Set a shipment status to start the timeline."
            />
          </section>
        </div>

        {/* Right column: summary + management */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Summary</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Subtotal" value={order.subtotal} />
              <Row label="Shipping" value={order.shippingTotal} />
              <Row label="Taxes" value={order.tax} />
              {order.discount.amount > 0 && <Row label="Discount" value={order.discount} negative />}
              <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-heading text-base font-semibold text-foreground">Total</dt>
                <dd className="font-heading text-lg font-semibold text-foreground">
                  {formatMoney(order.total)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="capitalize">Payment: {order.paymentMethod}</span>
              <span className="capitalize">Delivery: {order.deliveryMethod}</span>
              {order.razorpayPaymentId && <span>Razorpay: {order.razorpayPaymentId}</span>}
            </div>
          </section>

          <OrderStatusControl
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
          />

          <ShipmentTrackingControl orderId={order.id} shipment={order.shipment} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, negative }: { label: string; value: Money; negative?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">
        {negative ? "− " : ""}
        {formatMoney(value)}
      </dd>
    </div>
  );
}
