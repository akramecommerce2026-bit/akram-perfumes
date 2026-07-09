"use client";

import { ShoppingCart } from "lucide-react";

import { DashboardEmpty, DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { AdminOrderSummary } from "@/types/admin";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground",
  packed: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground",
  shipped: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground",
  delivered: "bg-[color-mix(in_oklab,var(--accent)_22%,transparent)] text-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function RecentOrders({ orders }: { orders: readonly AdminOrderSummary[] }) {
  return (
    <DashboardPanel title="Recent Orders" description="Latest orders across the store">
      {orders.length === 0 ? (
        <DashboardEmpty
          icon={<ShoppingCart className="size-5" aria-hidden="true" />}
          message="No orders yet. New orders will appear here as customers check out."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-foreground">{order.orderNumber}</span>
                <span className="text-xs text-muted-foreground">
                  {order.customerName} · {formatDate(order.createdAt)}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground",
                )}
              >
                {order.status}
              </span>
              <span className="w-20 text-right text-sm font-medium text-foreground">
                {formatMoney(order.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
