"use client";

import { useMemo, useState } from "react";

import { formatCompactRupees, formatRupees } from "@/lib/admin/analytics-format";
import { cn } from "@/lib/utils";
import type { RevenuePoint, RevenueSeries } from "@/types/admin-analytics";

type Period = "7d" | "30d" | "12mo";

const PERIODS: { value: Period; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "12mo", label: "Last 12 months" },
];

const W = 760;
const H = 280;
const PAD = { top: 20, right: 16, bottom: 36, left: 52 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const BASE_Y = PAD.top + PLOT_H;

export function RevenueChart({ series }: { series: RevenueSeries }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [active, setActive] = useState<number | null>(null);

  const points = useMemo<readonly RevenuePoint[]>(() => {
    if (period === "7d") return series.last7Days;
    if (period === "12mo") return series.last12Months;
    return series.last30Days;
  }, [period, series]);

  const geom = useMemo(() => {
    const n = points.length;
    const maxRev = Math.max(1, ...points.map((p) => p.revenue));
    const axisMax = maxRev * 1.15;
    const x = (i: number) => (n <= 1 ? PAD.left + PLOT_W / 2 : PAD.left + (i * PLOT_W) / (n - 1));
    const y = (v: number) => PAD.top + PLOT_H * (1 - v / axisMax);
    const step = n <= 1 ? PLOT_W : PLOT_W / (n - 1);
    const coords = points.map((p, i) => ({ x: x(i), y: y(p.revenue) }));
    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
    const area = `M${x(0).toFixed(1)},${BASE_Y} ${coords
      .map((c) => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ")} L${x(n - 1).toFixed(1)},${BASE_Y} Z`;
    const gridlines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      y: PAD.top + PLOT_H * (1 - f),
      value: axisMax * f,
    }));
    const labelEvery = Math.max(1, Math.ceil(n / 8));
    return { n, x, y, step, coords, line, area, gridlines, labelEvery };
  }, [points]);

  const total = points.reduce((sum, p) => sum + p.revenue, 0);
  const hasData = total > 0;
  const activePoint = active !== null ? points[active] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Revenue ({PERIODS.find((p) => p.value === period)!.label.toLowerCase()})</p>
          <p className="font-heading text-2xl font-semibold text-foreground">{formatRupees(total)}</p>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-border bg-background p-0.5" role="tablist" aria-label="Revenue period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="tab"
              aria-selected={period === p.value}
              onClick={() => { setPeriod(p.value); setActive(null); }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Revenue chart, ${PERIODS.find((p) => p.value === period)!.label}, total ${formatRupees(total)}`}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines + y labels */}
          {geom.gridlines.map((g, i) => (
            <g key={i}>
              <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y} stroke="var(--border)" strokeWidth="1" />
              <text x={PAD.left - 8} y={g.y + 4} textAnchor="end" className="fill-[var(--muted-foreground)]" fontSize="11">
                {formatCompactRupees(g.value)}
              </text>
            </g>
          ))}

          {/* Area + line */}
          {hasData && <path d={geom.area} fill="url(#revenueFill)" />}
          <path d={geom.line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* X labels */}
          {points.map((p, i) =>
            i % geom.labelEvery === 0 || i === geom.n - 1 ? (
              <text key={p.key} x={geom.x(i)} y={H - 12} textAnchor="middle" className="fill-[var(--muted-foreground)]" fontSize="11">
                {p.label}
              </text>
            ) : null,
          )}

          {/* Active guide + point */}
          {activePoint && active !== null && (
            <g>
              <line x1={geom.x(active)} y1={PAD.top} x2={geom.x(active)} y2={BASE_Y} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={geom.x(active)} cy={geom.y(activePoint.revenue)} r="4.5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2" />
            </g>
          )}

          {/* Hover capture segments */}
          <g onMouseLeave={() => setActive(null)}>
            {points.map((p, i) => (
              <rect
                key={p.key}
                x={geom.x(i) - geom.step / 2}
                y={PAD.top}
                width={geom.step}
                height={PLOT_H}
                fill="transparent"
                onMouseEnter={() => setActive(i)}
              />
            ))}
          </g>

          {/* SVG tooltip */}
          {activePoint && active !== null && (
            <g transform={`translate(${Math.min(Math.max(geom.x(active) - 60, PAD.left), W - PAD.right - 120)}, ${Math.max(geom.y(activePoint.revenue) - 58, 4)})`}>
              <rect width="120" height="46" rx="8" fill="var(--popover)" stroke="var(--border)" />
              <text x="10" y="19" className="fill-[var(--muted-foreground)]" fontSize="11">{activePoint.label}</text>
              <text x="10" y="36" className="fill-[var(--foreground)]" fontSize="13" fontWeight="600">
                {formatRupees(activePoint.revenue)}
                <tspan className="fill-[var(--muted-foreground)]" fontWeight="400"> · {activePoint.orders}o</tspan>
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
