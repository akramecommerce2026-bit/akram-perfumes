"use client";

import { Boxes, PackagePlus, RefreshCw, ShieldCheck, type LucideIcon } from "lucide-react";

import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";

interface ActivityItem {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly detail: string;
  readonly time: string;
}

// Placeholder activity — a real feed (audit log) is wired in a later milestone.
const ACTIVITY: readonly ActivityItem[] = [
  {
    icon: RefreshCw,
    title: "Catalogue synced",
    detail: "Products refreshed from Supabase",
    time: "Just now",
  },
  {
    icon: PackagePlus,
    title: "Inventory seeded",
    detail: "12 products · 30 variants imported",
    time: "Today",
  },
  {
    icon: ShieldCheck,
    title: "Admin access enabled",
    detail: "Secure authentication configured",
    time: "Today",
  },
  {
    icon: Boxes,
    title: "Store initialised",
    detail: "Categories and taxonomy created",
    time: "This week",
  },
];

export function ActivityTimeline() {
  return (
    <DashboardPanel title="Recent Activity" description="System activity timeline">
      <ol className="flex flex-col">
        {ACTIVITY.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === ACTIVITY.length - 1;
          return (
            <li key={item.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {!isLast && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
              </div>
              <div className={isLast ? "pb-0" : "pb-5"}>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">{item.time}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </DashboardPanel>
  );
}
