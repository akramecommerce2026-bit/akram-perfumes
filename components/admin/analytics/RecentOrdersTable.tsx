import Link from "next/link";

import { PaymentStatusBadge } from "@/components/admin/orders/StatusBadge";
import { ShipmentStatusBadge } from "@/components/shipment/ShipmentStatusBadge";
import { formatMoney } from "@/lib/money";
import type { RecentOrderRow } from "@/types/admin-analytics";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function RecentOrdersTable({ orders }: { orders: readonly RecentOrderRow[] }) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Orders</h2>
        <Link href="/admin/orders" className="text-xs font-medium text-accent hover:underline">
          View all
        </Link>
      </header>

      {orders.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Shipment</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-accent">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{order.customerName}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{formatMoney(order.total)}</td>
                  <td className="px-6 py-3"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-6 py-3"><ShipmentStatusBadge status={order.shipmentStatus} /></td>
                  <td className="px-6 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
