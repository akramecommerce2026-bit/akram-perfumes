import { Users } from "lucide-react";

import { formatMoney } from "@/lib/money";
import type { CustomerInsights as CustomerInsightsData } from "@/types/admin-analytics";

export function CustomerInsights({ data }: { data: CustomerInsightsData }) {
  const tiles = [
    { label: "Total Customers", value: String(data.totalCustomers) },
    { label: "Returning Customers", value: String(data.returningCustomers) },
    { label: "New Customers", value: String(data.newCustomers) },
    { label: "Repeat Purchase Rate", value: `${(data.repeatPurchaseRate * 100).toFixed(0)}%` },
    { label: "Avg. Customer Spend", value: formatMoney(data.averageCustomerSpend) },
  ];

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-accent" aria-hidden="true" />
        <h2 className="font-heading text-lg font-semibold text-foreground">Customer Analytics</h2>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-1 rounded-xl border border-border/70 bg-background p-4">
            <dt className="text-xs text-muted-foreground">{tile.label}</dt>
            <dd className="font-heading text-xl font-semibold text-foreground">{tile.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
