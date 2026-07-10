import { cn } from "@/lib/utils";
import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/types/shipment";

const ACCENT_SOFT = "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground";
const ACCENT_STRONG = "bg-[color-mix(in_oklab,var(--accent)_30%,transparent)] text-foreground";
const MUTED = "bg-muted text-muted-foreground";
const DESTRUCTIVE = "bg-destructive/10 text-destructive";
const AMBER = "bg-amber-500/15 text-amber-700 dark:text-amber-400";

const SHIPMENT_STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending: MUTED,
  confirmed: ACCENT_SOFT,
  packed: ACCENT_SOFT,
  shipped: ACCENT_STRONG,
  out_for_delivery: ACCENT_STRONG,
  delivered: ACCENT_STRONG,
  cancelled: DESTRUCTIVE,
  returned: AMBER,
};

export function ShipmentStatusBadge({
  status,
  className,
}: {
  status: ShipmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        SHIPMENT_STATUS_STYLES[status],
        className,
      )}
    >
      {SHIPMENT_STATUS_LABELS[status]}
    </span>
  );
}
