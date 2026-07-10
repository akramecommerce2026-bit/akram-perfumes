import { cn } from "@/lib/utils";
import type { AdminCustomerStatus } from "@/types/admin-customer";

const STATUS_STYLES: Record<AdminCustomerStatus, string> = {
  active: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground",
  inactive: "bg-muted text-muted-foreground",
  deleted: "bg-destructive/10 text-destructive",
};

export function CustomerStatusBadge({ status }: { status: AdminCustomerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status],
      )}
    >
      {status}
    </span>
  );
}
