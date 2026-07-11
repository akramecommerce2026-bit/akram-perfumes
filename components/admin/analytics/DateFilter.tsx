"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ANALYTICS_PRESETS } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";
import type { AnalyticsPreset, ResolvedRange } from "@/types/admin-analytics";

export function DateFilter({ range }: { range: ResolvedRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(range.fromDate);
  const [to, setTo] = useState(range.toDate);

  function select(preset: AnalyticsPreset) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("range", preset);
    if (preset !== "custom") {
      sp.delete("from");
      sp.delete("to");
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  function applyCustom() {
    if (!from || !to) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("range", "custom");
    sp.set("from", from);
    sp.set("to", to);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date range">
        {ANALYTICS_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            aria-pressed={range.preset === preset.value}
            onClick={() => select(preset.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              range.preset === preset.value
                ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {range.preset === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
          </label>
          <button
            type="button"
            onClick={applyCustom}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
