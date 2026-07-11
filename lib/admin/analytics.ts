import type {
  AnalyticsPreset,
  ResolvedRange,
  RevenuePoint,
} from "@/types/admin-analytics";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Presets offered by the date-filter toolbar, in display order. */
export const ANALYTICS_PRESETS: readonly { value: AnalyticsPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

const PRESET_VALUES = new Set<AnalyticsPreset>(ANALYTICS_PRESETS.map((p) => p.value));

export function isAnalyticsPreset(value: string | undefined): value is AnalyticsPreset {
  return value !== undefined && PRESET_VALUES.has(value as AnalyticsPreset);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format a Date to yyyy-mm-dd using LOCAL components (not UTC) for round-trip stability. */
function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse a yyyy-mm-dd input as a LOCAL date (avoids the UTC shift of `new Date(str)`). */
function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function fmtShort(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
}

/**
 * Resolve a preset (+ optional custom bounds) into a concrete half-open window
 * [fromISO, toISO). `to` is the start of the day *after* the last included day.
 */
export function resolveRange(
  preset: AnalyticsPreset,
  fromParam?: string,
  toParam?: string,
): ResolvedRange {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);

  let from = todayStart;
  let to = tomorrowStart;
  let label = "Today";

  switch (preset) {
    case "today":
      from = todayStart;
      break;
    case "7d":
      from = new Date(todayStart.getTime() - 6 * DAY_MS);
      label = "Last 7 days";
      break;
    case "90d":
      from = new Date(todayStart.getTime() - 89 * DAY_MS);
      label = "Last 90 days";
      break;
    case "year":
      from = new Date(now.getFullYear(), 0, 1);
      label = "This year";
      break;
    case "custom": {
      const defaultFrom = new Date(todayStart.getTime() - 29 * DAY_MS);
      const parsedFrom = (fromParam && parseDateInput(fromParam)) || defaultFrom;
      const parsedTo = (toParam && parseDateInput(toParam)) || now;
      from = startOfDay(parsedFrom);
      to = new Date(startOfDay(parsedTo).getTime() + DAY_MS);
      label = `${fmtShort(from)} – ${fmtShort(new Date(to.getTime() - DAY_MS))}`;
      break;
    }
    case "30d":
    default:
      from = new Date(todayStart.getTime() - 29 * DAY_MS);
      label = "Last 30 days";
      break;
  }

  return {
    preset,
    fromISO: from.toISOString(),
    toISO: to.toISOString(),
    label,
    fromDate: toDateInput(from),
    toDate: toDateInput(new Date(to.getTime() - DAY_MS)),
  };
}

/** Minimal order shape the pure aggregation helpers need. */
export interface OrderPoint {
  readonly createdAt: string;
  readonly total: number;
  readonly paid: boolean;
}

function dayKey(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

/** Revenue (paid) + order counts bucketed by day for the trailing `days` days. */
export function buildDailySeries(orders: readonly OrderPoint[], days: number): RevenuePoint[] {
  const todayStart = startOfDay(new Date());
  const buckets = new Map<string, { revenue: number; orders: number }>();

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(todayStart.getTime() - i * DAY_MS);
    buckets.set(dayKey(day), { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const bucket = buckets.get(dayKey(new Date(order.createdAt)));
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.paid) bucket.revenue += order.total;
  }

  return [...buckets.entries()].map(([key, value]) => {
    const date = new Date(`${key}T00:00:00`);
    const label = days <= 7
      ? new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date)
      : fmtShort(date);
    return { key, label, revenue: value.revenue, orders: value.orders };
  });
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Revenue (paid) + order counts bucketed by month for the trailing `months` months. */
export function buildMonthlySeries(orders: readonly OrderPoint[], months: number): RevenuePoint[] {
  const now = new Date();
  const buckets = new Map<string, { revenue: number; orders: number }>();

  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(monthKey(month), { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const bucket = buckets.get(monthKey(new Date(date.getFullYear(), date.getMonth(), 1)));
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.paid) bucket.revenue += order.total;
  }

  return [...buckets.entries()].map(([key, value]) => {
    const [year, month] = key.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const short = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
    // Disambiguate a 12-month window that spans a year boundary by tagging Jan.
    const label = month === 1 ? `${short} ’${String(year).slice(2)}` : short;
    return { key, label, revenue: value.revenue, orders: value.orders };
  });
}
