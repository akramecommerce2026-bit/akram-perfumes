"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { CartTotals } from "@/components/cart/CartTotals";
import { CouponInput } from "@/components/cart/CouponInput";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/cart";
import { createMoney, formatMoney } from "@/lib/money";
import type { CartTotals as CartTotalsData } from "@/types/cart";

interface CartSummaryProps {
  totals: CartTotalsData;
}

export function CartSummary({ totals }: CartSummaryProps) {
  const remaining = FREE_SHIPPING_THRESHOLD - totals.subtotal.amount;
  const shortfall =
    remaining > 0 ? createMoney(remaining, totals.subtotal.currency) : null;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
      <h2 className="font-heading text-xl font-semibold text-foreground">Order Summary</h2>

      <CartTotals totals={totals} />

      {shortfall && STANDARD_SHIPPING > 0 && (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-4 py-3 text-xs text-foreground">
          Add {formatMoney(shortfall)} more to unlock free shipping.
        </p>
      )}

      <CouponInput />

      <Link
        href="/checkout"
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Proceed to Checkout
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Secure, encrypted checkout
      </p>
    </div>
  );
}
