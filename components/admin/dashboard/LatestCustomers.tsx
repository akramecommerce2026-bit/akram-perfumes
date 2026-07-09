"use client";

import { Users } from "lucide-react";

import { DashboardEmpty, DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import type { AdminCustomerSummary } from "@/types/admin";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(iso));
}

export function LatestCustomers({ customers }: { customers: readonly AdminCustomerSummary[] }) {
  return (
    <DashboardPanel title="Latest Customers" description="Newest registered customers">
      {customers.length === 0 ? (
        <DashboardEmpty
          icon={<Users className="size-5" aria-hidden="true" />}
          message="No customers yet. Customer profiles will appear here after the first orders."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {customers.map((customer) => (
            <li key={customer.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
              >
                {initials(customer.fullName)}
              </span>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">{customer.fullName}</span>
                <span className="truncate text-xs text-muted-foreground">{customer.email}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(customer.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
