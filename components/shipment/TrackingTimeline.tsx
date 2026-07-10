import { CheckCircle2, CreditCard, PackageCheck, RotateCcw, ShoppingBag, Truck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TrackingTimelineEntry } from "@/types/shipment";

function iconFor(entry: TrackingTimelineEntry) {
  if (entry.type === "order_placed") return ShoppingBag;
  if (entry.type === "payment") return CreditCard;
  switch (entry.status) {
    case "delivered":
      return PackageCheck;
    case "out_for_delivery":
    case "shipped":
      return Truck;
    case "cancelled":
      return XCircle;
    case "returned":
      return RotateCcw;
    default:
      return CheckCircle2;
  }
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface TrackingTimelineProps {
  timeline: readonly TrackingTimelineEntry[];
  emptyMessage?: string;
  className?: string;
}

/**
 * Chronological (oldest-first) shipment timeline. The final entry is emphasized
 * as the current state. Shared by the admin order detail and customer tracking
 * page so both render an identical sequence.
 */
export function TrackingTimeline({ timeline, emptyMessage, className }: TrackingTimelineProps) {
  if (timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyMessage ?? "No tracking updates yet."}
      </p>
    );
  }

  const lastIndex = timeline.length - 1;

  return (
    <ol className={cn("flex flex-col", className)}>
      {timeline.map((entry, index) => {
        const Icon = iconFor(entry);
        const isCurrent = index === lastIndex;
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border",
                  isCurrent
                    ? "border-transparent bg-accent text-accent-foreground shadow-gold"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {index < lastIndex && <span className="w-px flex-1 bg-border" aria-hidden="true" />}
            </div>
            <div className={cn("flex flex-col pb-6", isCurrent && "pb-1")}>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {entry.title}
              </span>
              <span className="text-xs text-muted-foreground/70">{formatDateTime(entry.at)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
