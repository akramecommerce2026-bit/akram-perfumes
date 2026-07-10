import { Check, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";

/** Happy-path stages shown on the progress bar, in order. */
const PROGRESS_STAGES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

type ProgressStage = (typeof PROGRESS_STAGES)[number];

/** Compact stage labels for the progress bar (Pending is shown as "Placed"). */
const STAGE_LABELS: Record<ProgressStage, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

/**
 * Horizontal shipment progress bar. Off-track terminal states (cancelled /
 * returned) render an explanatory banner instead of the stepped bar.
 */
export function ShipmentProgress({ status }: { status: ShipmentStatus }) {
  const currentIndex = (PROGRESS_STAGES as readonly ShipmentStatus[]).indexOf(status);

  if (currentIndex === -1) {
    const isCancelled = status === "cancelled";
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border p-4 text-sm",
          isCancelled
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        )}
      >
        <XCircle className="size-5 shrink-0" aria-hidden="true" />
        <span>
          This order was <strong>{SHIPMENT_STATUS_LABELS[status]}</strong>. Please contact support if
          you need assistance.
        </span>
      </div>
    );
  }

  const fillPct =
    PROGRESS_STAGES.length > 1 ? (currentIndex / (PROGRESS_STAGES.length - 1)) * 100 : 0;

  return (
    <div className="w-full">
      <ol className="relative flex items-start justify-between">
        {/* Track + fill sit behind the nodes, aligned to the dot centres. */}
        <span
          className="absolute top-3.5 right-3 left-3 h-0.5 -translate-y-1/2 bg-border"
          aria-hidden="true"
        />
        <span
          className="absolute top-3.5 left-3 h-0.5 -translate-y-1/2 bg-accent transition-all"
          style={{ width: `calc((100% - 1.5rem) * ${fillPct / 100})` }}
          aria-hidden="true"
        />

        {PROGRESS_STAGES.map((stage, index) => {
          // The delivered end-state counts as complete (checkmark, not a number).
          const done = index < currentIndex || (index === currentIndex && status === "delivered");
          const current = index === currentIndex && !done;
          return (
            <li key={stage} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold transition-colors",
                  done && "border-accent bg-accent text-accent-foreground",
                  current && "border-accent text-accent shadow-gold",
                  !done && !current && "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "max-w-[4.5rem] text-center text-[11px] leading-tight sm:text-xs",
                  current ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
