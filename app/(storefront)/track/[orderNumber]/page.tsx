import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ExternalLink, Package, PackageSearch, Truck } from "lucide-react";

import { Container } from "@/components/common/container";
import { CopyTrackingNumber } from "@/components/shipment/CopyTrackingNumber";
import { ShipmentProgress } from "@/components/shipment/ShipmentProgress";
import { ShipmentStatusBadge } from "@/components/shipment/ShipmentStatusBadge";
import { TrackingTimeline } from "@/components/shipment/TrackingTimeline";
import { formatMoney } from "@/lib/money";
import { orderTrackingService } from "@/services/order-tracking-service";

export const metadata: Metadata = {
  title: "Track Your Order — Akram Perfumes",
  description: "Track the status and delivery of your Akram Perfumes order.",
  robots: { index: false },
};

interface TrackPageProps {
  params: Promise<{ orderNumber: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export default async function TrackOrderPage({ params }: TrackPageProps) {
  const { orderNumber: raw } = await params;
  const orderNumber = decodeURIComponent(raw);
  const data = await orderTrackingService.getByOrderNumber(orderNumber);

  if (!data) {
    return (
      <div className="py-section-sm lg:py-section">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageSearch className="size-7" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-semibold text-foreground">Order not found</h1>
              <p className="text-sm text-muted-foreground">
                We couldn&rsquo;t find an order matching{" "}
                <span className="font-medium text-foreground">{orderNumber}</span>. Please check the
                order number and try again.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Continue Shopping
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const { tracking } = data;

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Order Tracking</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                {data.orderNumber}
              </h1>
              <ShipmentStatusBadge status={tracking.shipmentStatus} className="px-3 py-1 text-sm" />
            </div>
            <p className="text-sm text-muted-foreground">Placed on {formatDate(data.createdAt)}</p>
          </header>

          {/* Progress */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[440px]">
                <ShipmentProgress status={tracking.shipmentStatus} />
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            {/* Timeline */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">Tracking history</h2>
              <TrackingTimeline
                timeline={data.timeline}
                emptyMessage="No tracking updates yet. We'll update this as your order progresses."
              />
            </section>

            {/* Details */}
            <div className="flex flex-col gap-6">
              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                  <Truck className="size-4 text-accent" aria-hidden="true" /> Shipment
                </h2>

                <DetailRow label="Courier">
                  {tracking.courierPartner || <span className="text-muted-foreground">Not assigned</span>}
                </DetailRow>

                <DetailRow label="Tracking number">
                  {tracking.trackingNumber ? (
                    <CopyTrackingNumber value={tracking.trackingNumber} />
                  ) : (
                    <span className="text-muted-foreground">Not available yet</span>
                  )}
                </DetailRow>

                <DetailRow label="Estimated delivery" icon={<Calendar className="size-4" aria-hidden="true" />}>
                  {formatDate(tracking.estimatedDelivery)}
                </DetailRow>

                {tracking.trackingUrl && (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" /> Track Shipment
                  </a>
                )}
              </section>

              <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                  <Package className="size-4 text-accent" aria-hidden="true" /> Order summary
                </h2>
                <dl className="flex flex-col gap-2 text-sm">
                  <SummaryRow label="Order number" value={data.orderNumber} />
                  <SummaryRow label="Items" value={String(data.itemCount)} />
                  <SummaryRow label="Order total" value={formatMoney(data.total)} />
                  <SummaryRow
                    label="Payment"
                    value={data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1)}
                  />
                </dl>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function DetailRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
