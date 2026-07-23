"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { SelectableCard } from "@/components/checkout/SelectableCard";
import { PAYMENT_OPTIONS } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";

/**
 * Payment method selector. Razorpay is the only gateway — its Checkout widget
 * handles UPI, cards, net banking and wallets internally — so a single option
 * renders, still driven by PAYMENT_OPTIONS rather than hardcoded here.
 */
export function PaymentOptions() {
  const { register, control } = useFormContext<CheckoutFormValues>();
  const selected = useWatch({ control, name: "paymentMethod" });

  return (
    <CheckoutSection
      step={3}
      title="Payment Method"
      description="Secured payments — no charge until you confirm."
    >
      <div className="flex flex-col gap-3">
        {PAYMENT_OPTIONS.map((method) => (
          <SelectableCard
            key={method.id}
            value={method.id}
            checked={selected === method.id}
            register={register("paymentMethod")}
            icon={<ShieldCheck className="size-5" aria-hidden="true" />}
            title={method.name}
            description={method.description}
          />
        ))}
      </div>

      <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        Payments are handled securely by Razorpay — card, UPI and banking details are never stored on
        our servers.
      </p>
    </CheckoutSection>
  );
}
