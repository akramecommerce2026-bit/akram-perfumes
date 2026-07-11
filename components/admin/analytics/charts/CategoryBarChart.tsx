import { formatRupees } from "@/lib/admin/analytics-format";
import type { CategoryRevenue } from "@/types/admin-analytics";

/** Horizontal revenue-by-category bars. Presentational + responsive (CSS widths). */
export function CategoryBarChart({ data }: { data: readonly CategoryRevenue[] }) {
  const max = Math.max(1, ...data.map((c) => c.revenue.amount));

  return (
    <ul className="flex flex-col gap-4">
      {data.map((category) => {
        const pct = Math.max(2, Math.round((category.revenue.amount / max) * 100));
        return (
          <li key={category.categoryId} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-foreground">{category.name}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatRupees(category.revenue.amount)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[color-mix(in_oklab,var(--accent)_70%,transparent)] to-accent"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
