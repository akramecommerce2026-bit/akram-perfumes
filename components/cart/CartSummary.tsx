"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { CartTotals } from "@/components/cart/CartTotals";
import { storefrontButton } from "@/components/common/button";
import { cn } from "@/lib/utils";
import { CouponInput } from "@/components/cart/CouponInput";
import type { CartTotals as CartTotalsData } from "@/types/cart";

interface CartSummaryProps {
  totals: CartTotalsData;
}

export function CartSummary({ totals }: CartSummaryProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:p-7">
      <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>

      <CartTotals totals={totals} />

      <CouponInput />

      <Link
        href="/checkout"
        className={cn(storefrontButton({ variant: "primary", size: "lg", block: true }), "group")}
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
