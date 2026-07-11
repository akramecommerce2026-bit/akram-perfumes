import { PackageCheck, ShoppingBag, Truck, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ActivityItem, ActivityType } from "@/types/admin-analytics";

const ICONS: Record<ActivityType, LucideIcon> = {
  order_created: ShoppingBag,
  shipment_updated: Truck,
  order_delivered: PackageCheck,
  customer_registered: UserPlus,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function ActivityFeed({ items }: { items: readonly ActivityItem[] }) {
  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-6 py-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Recent Activity</h2>
      </header>

      {items.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => {
            const Icon = ICONS[item.type];
            return (
              <li key={item.id} className="flex items-start gap-3 px-6 py-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                  {item.description && (
                    <span className="truncate text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground/70">{timeAgo(item.at)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
