"use client";

import { useFormContext } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { PAYMENT_OPTIONS } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";

/**
 * Payment section — a single method: Secure Payment via Razorpay. Razorpay
 * Checkout handles UPI, cards, net banking and wallets internally, so no
 * provider selection is exposed. The gateway itself is wired in a later phase;
 * the method is registered on the form so every order is tied to Razorpay.
 */
export function PaymentOptions() {
  const { register } = useFormContext<CheckoutFormValues>();
  const razorpay = PAYMENT_OPTIONS[0];

  return (
    <CheckoutSection
      step={4}
      title="Payment Method"
      description="Secured payments — no charge until you confirm."
    >
      {/* Single fixed method; value is submitted via this hidden field. */}
      <input type="hidden" value="razorpay" {...register("paymentMethod")} />

      <div className="flex items-center gap-4 rounded-xl border border-accent bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] p-4 shadow-sm">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-medium text-foreground">{razorpay.name}</span>
          <span className="text-xs text-muted-foreground">{razorpay.description}</span>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        You&rsquo;ll complete payment securely via Razorpay. Card, UPI and banking details are
        handled by Razorpay and never stored on our servers.
      </p>
    </CheckoutSection>
  );
}
