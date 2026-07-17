"use client";

import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { CartTotals as CartTotalsData } from "@/types/cart";

interface CartTotalsProps {
  totals: CartTotalsData;
  className?: string;
}

export function CartTotals({ totals, className }: CartTotalsProps) {
  return (
    <dl className={cn("flex flex-col gap-3 text-sm", className)}>
      <Row label="Subtotal" value={formatMoney(totals.subtotal)} />
      <Row label="Taxes" value="Calculated at checkout" muted />
      {totals.discount.amount > 0 && (
        <Row label="Discount" value={`− ${formatMoney(totals.discount)}`} />
      )}
      <div className="mt-1 flex items-baseline justify-between border-t border-border pt-4">
        <dt className="text-base font-semibold text-foreground">Grand Total</dt>
        <dd className="text-lg font-semibold text-foreground">
          {formatMoney(totals.total)}
        </dd>
      </div>
    </dl>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
        {value}
      </dd>
    </div>
  );
}
