import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/checkout";

const ACCENT_SOFT = "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground";
const ACCENT_STRONG = "bg-[color-mix(in_oklab,var(--accent)_30%,transparent)] text-foreground";
const MUTED = "bg-muted text-muted-foreground";
const DESTRUCTIVE = "bg-destructive/10 text-destructive";
const AMBER = "bg-amber-500/15 text-amber-700 dark:text-amber-400";

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: MUTED,
  confirmed: ACCENT_SOFT,
  packed: ACCENT_SOFT,
  shipped: ACCENT_STRONG,
  delivered: ACCENT_STRONG,
  cancelled: DESTRUCTIVE,
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: MUTED,
  paid: ACCENT_SOFT,
  failed: DESTRUCTIVE,
  refunded: AMBER,
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", className)}>
      {label}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={status} className={ORDER_STATUS_STYLES[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge label={status} className={PAYMENT_STATUS_STYLES[status]} />;
}
