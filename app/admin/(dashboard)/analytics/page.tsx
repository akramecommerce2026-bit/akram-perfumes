import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { ActivityFeed } from "@/components/admin/analytics/ActivityFeed";
import { BestSellers } from "@/components/admin/analytics/BestSellers";
import { CategoryBarChart } from "@/components/admin/analytics/charts/CategoryBarChart";
import { CustomerInsights } from "@/components/admin/analytics/CustomerInsights";
import { DateFilter } from "@/components/admin/analytics/DateFilter";
import { ExportMenu } from "@/components/admin/analytics/ExportMenu";
import { KpiOverview } from "@/components/admin/analytics/KpiOverview";
import { OrdersByStatus } from "@/components/admin/analytics/OrdersByStatus";
import { RecentOrdersTable } from "@/components/admin/analytics/RecentOrdersTable";
import { RevenueChart } from "@/components/admin/analytics/charts/RevenueChart";
import { isAnalyticsPreset, resolveRange } from "@/lib/admin/analytics";
import { adminAnalyticsService } from "@/services/admin-analytics-service";

export const metadata: Metadata = {
  title: "Analytics — Akram Perfumes Admin",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const presetParam = first(params.range);
  const preset = isAnalyticsPreset(presetParam) ? presetParam : "30d";
  const range = resolveRange(preset, first(params.from), first(params.to));

  const dashboard = await adminAnalyticsService.getDashboard(range);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-6 text-accent" aria-hidden="true" />
            <div>
              <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                Store performance for <span className="font-medium text-foreground">{range.label.toLowerCase()}</span>.
              </p>
            </div>
          </div>
          <ExportMenu dashboard={dashboard} />
        </div>
        <DateFilter range={range} />
      </header>

      <KpiOverview stats={dashboard.overview} />

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <RevenueChart series={dashboard.revenue} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersByStatus data={dashboard.statusBreakdown} rangeLabel={range.label} />
        <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">Revenue by Category</h2>
            <p className="text-xs text-muted-foreground">{range.label}</p>
          </div>
          {dashboard.categoryRevenue.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No category revenue in this period.
            </p>
          ) : (
            <CategoryBarChart data={dashboard.categoryRevenue} />
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BestSellers products={dashboard.bestSellers} rangeLabel={range.label} />
        <ActivityFeed items={dashboard.activity} />
      </div>

      <CustomerInsights data={dashboard.customers} />

      <RecentOrdersTable orders={dashboard.recentOrders} />
    </div>
  );
}
