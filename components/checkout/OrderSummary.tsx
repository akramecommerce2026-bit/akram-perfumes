"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { CartTotals } from "@/components/cart/CartTotals";
import { formatMoney } from "@/lib/money";
import type { CartItem, CartTotals as CartTotalsData } from "@/types/cart";

interface OrderSummaryProps {
  items: readonly CartItem[];
  totals: CartTotalsData;
  /** CTA / actions rendered under the totals (e.g. Continue / Place Order). */
  children?: ReactNode;
}

/**
 * Read-only order summary for the checkout right column. Reuses the cart's
 * CartTotals for the money breakdown (no duplicated totals UI) and lists each
 * line with its selected variant, quantity and line subtotal.
 */
export function OrderSummary({ items, totals, children }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <h2 className="font-heading text-xl font-semibold text-foreground">Order Summary</h2>

      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
              <Image src={item.featuredImage} alt={item.productName} fill sizes="64px" className="object-cover" />
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {item.quantity}
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-sm font-medium text-foreground">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{item.variantName}</p>
            </div>
            <span className="self-center text-sm font-medium text-foreground">
              {formatMoney(item.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      <CartTotals totals={totals} className="border-t border-border pt-5" />

      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}
