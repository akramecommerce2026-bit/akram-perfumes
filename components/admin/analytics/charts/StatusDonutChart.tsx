"use client";

import { useState } from "react";

import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";
import type { StatusCount } from "@/types/admin-analytics";

/** Categorical colors per shipment status — shared by the donut and the cards. */
export const STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending: "#94a3b8",
  confirmed: "#c8962a",
  packed: "#e0b44a",
  shipped: "#3b82f6",
  out_for_delivery: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  returned: "#f59e0b",
};

const R = 70;
const C = 2 * Math.PI * R;

export function StatusDonutChart({ data }: { data: readonly StatusCount[] }) {
  const [active, setActive] = useState<ShipmentStatus | null>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const segments = data.filter((d) => d.count > 0);

  const activeEntry = active ? data.find((d) => d.status === active) ?? null : null;
  const centerValue = activeEntry ? activeEntry.count : total;
  const centerLabel = activeEntry ? SHIPMENT_STATUS_LABELS[activeEntry.status] : "Total orders";

  // Precompute each arc's length + cumulative offset immutably (no render mutation).
  const arcs = segments.map((seg, i) => {
    const len = total > 0 ? (seg.count / total) * C : 0;
    const offset = segments.slice(0, i).reduce((sum, s) => sum + (s.count / total) * C, 0);
    return { status: seg.status, len, offset };
  });

  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 200" className="h-auto w-full -rotate-90" role="img" aria-label={`Orders by status, ${total} total`}>
        {/* Track */}
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--muted)" strokeWidth="24" />
        {total === 0 && <circle cx="100" cy="100" r={R} fill="none" stroke="var(--border)" strokeWidth="24" />}
        {arcs.map((arc) => {
          const isActive = active === arc.status;
          return (
            <circle
              key={arc.status}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={STATUS_COLORS[arc.status]}
              strokeWidth={isActive ? 30 : 24}
              strokeDasharray={`${arc.len} ${C - arc.len}`}
              strokeDashoffset={-arc.offset}
              className="cursor-pointer transition-[stroke-width]"
              onMouseEnter={() => setActive(arc.status)}
              onMouseLeave={() => setActive(null)}
            />
          );
        })}
      </svg>
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-heading text-3xl font-semibold text-foreground">{centerValue}</span>
        <span className="max-w-[7rem] text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  );
}
