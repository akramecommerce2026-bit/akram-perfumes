import { StatusDonutChart, STATUS_COLORS } from "@/components/admin/analytics/charts/StatusDonutChart";
import { SHIPMENT_STATUS_LABELS } from "@/types/shipment";
import type { StatusCount } from "@/types/admin-analytics";

export function OrdersByStatus({ data, rangeLabel }: { data: readonly StatusCount[]; rangeLabel: string }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Orders by Status</h2>
          <p className="text-xs text-muted-foreground">{rangeLabel}</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No orders in this period.
        </p>
      ) : (
        <div className="grid items-center gap-6 lg:grid-cols-[220px_1fr]">
          <StatusDonutChart data={data} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {data.map((item) => (
              <li
                key={item.status}
                className="flex flex-col gap-1 rounded-xl border border-border/70 bg-background p-3"
                style={{ borderLeftColor: STATUS_COLORS[item.status], borderLeftWidth: 3 }}
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
                  {SHIPMENT_STATUS_LABELS[item.status]}
                </span>
                <span className="font-heading text-xl font-semibold text-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
