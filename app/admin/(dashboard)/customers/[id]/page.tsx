import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Mail, MapPin, Phone, ShoppingBag, UserPlus } from "lucide-react";

import { CustomerActions } from "@/components/admin/customers/CustomerActions";
import { CustomerAvatar } from "@/components/admin/customers/Avatar";
import { CustomerStatusBadge } from "@/components/admin/customers/StatusBadge";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/StatusBadge";
import { formatMoney } from "@/lib/money";
import { adminCustomerService } from "@/services/admin-customer-service";
import type { ActivityEventType } from "@/types/admin-customer";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const TIMELINE_ICON: Record<ActivityEventType, typeof Clock> = {
  account_created: UserPlus,
  order_placed: ShoppingBag,
  order_paid: ShoppingBag,
  deactivated: Clock,
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customer = await adminCustomerService.getById(id);
  if (!customer) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            aria-label="Back to customers"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <CustomerAvatar name={customer.fullName} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                {customer.fullName}
              </h1>
              <CustomerStatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-muted-foreground">Joined {formatDate(customer.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          {/* Purchase statistics */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Purchase statistics</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat label="Total orders" value={String(customer.stats.totalOrders)} />
              <Stat label="Total spent" value={formatMoney(customer.stats.totalSpent)} />
              <Stat label="Avg. order value" value={formatMoney(customer.stats.averageOrderValue)} />
              <Stat label="First order" value={formatDate(customer.stats.firstOrderAt)} />
              <Stat label="Last order" value={formatDate(customer.stats.lastOrderAt)} />
            </dl>
          </section>

          {/* Order history */}
          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <header className="border-b border-border px-6 py-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Order history ({customer.orders.length})
              </h2>
            </header>
            {customer.orders.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No orders placed yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="px-6 py-3">Order</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Payment</th>
                      <th className="px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-foreground hover:text-accent"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{order.itemCount}</td>
                        <td className="px-6 py-3 font-medium text-foreground">{formatMoney(order.total)}</td>
                        <td className="px-6 py-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-6 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                        <td className="px-6 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Saved addresses */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Saved addresses</h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {customer.addresses.map((address) => {
                  const lines = [
                    address.line1,
                    address.line2,
                    address.landmark,
                    `${address.city}, ${address.state} ${address.pincode}`,
                    address.country,
                  ].filter(Boolean);
                  return (
                    <li key={address.id} className="rounded-xl border border-border/60 bg-background p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                        {address.isDefault && (
                          <span className="rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] px-2 py-0.5 text-xs font-medium text-accent-foreground">
                            Default
                          </span>
                        )}
                      </div>
                      <address className="flex flex-col gap-0.5 text-sm text-muted-foreground not-italic">
                        {lines.map((line, i) => (
                          <span key={i}>{line}</span>
                        ))}
                      </address>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Customer information</h2>
            <dl className="flex flex-col gap-3 text-sm">
              <InfoRow icon={<Mail className="size-4" aria-hidden="true" />} label="Email" value={customer.email} />
              <InfoRow icon={<Phone className="size-4" aria-hidden="true" />} label="Phone" value={customer.phone || "—"} />
              <InfoRow icon={<Clock className="size-4" aria-hidden="true" />} label="Joined" value={formatDate(customer.createdAt)} />
            </dl>
          </section>

          <CustomerActions customerId={customer.id} status={customer.status} />

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Activity timeline</h2>
            <ol className="flex flex-col gap-4">
              {customer.timeline.map((event) => {
                const Icon = TIMELINE_ICON[event.type];
                return (
                  <li key={event.id} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{event.title}</span>
                      <span className="text-xs text-muted-foreground">{event.description}</span>
                      <span className="text-xs text-muted-foreground/70">{formatDateTime(event.at)}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background p-4">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="font-heading text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex flex-col overflow-hidden">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-foreground">{value}</dd>
      </div>
    </div>
  );
}
