"use client";

import { PackageCheck } from "lucide-react";

import { DashboardEmpty, DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { cn } from "@/lib/utils";
import type { LowStockVariant } from "@/types/admin";

export function LowStockProducts({ items }: { items: readonly LowStockVariant[] }) {
  return (
    <DashboardPanel title="Low Stock Products" description="Variants running low on inventory">
      {items.length === 0 ? (
        <DashboardEmpty
          icon={<PackageCheck className="size-5" aria-hidden="true" />}
          message="All products are well stocked."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.variantId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.productName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.variantName} · {item.sku}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  item.stock === 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground",
                )}
              >
                {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}
