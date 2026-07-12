"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ShieldCheck, Wallet } from "lucide-react";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { SelectableCard } from "@/components/checkout/SelectableCard";
import { availablePaymentMethods } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";

/**
 * Payment method selector. Cash on Delivery is always available; Razorpay is
 * offered only when the gateway is configured (`NEXT_PUBLIC_RAZORPAY_KEY_ID`).
 * Razorpay Checkout handles UPI, cards, net banking and wallets internally.
 */
export function PaymentOptions() {
  const { register, control } = useFormContext<CheckoutFormValues>();
  const selected = useWatch({ control, name: "paymentMethod" });
  const methods = availablePaymentMethods();

  return (
    <CheckoutSection
      step={4}
      title="Payment Method"
      description="Secured payments — no charge until you confirm."
    >
      <div className="flex flex-col gap-3">
        {methods.map((method) => (
          <SelectableCard
            key={method.id}
            value={method.id}
            checked={selected === method.id}
            register={register("paymentMethod")}
            icon={
              method.id === "cod" ? (
                <Wallet className="size-5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-5" aria-hidden="true" />
              )
            }
            title={method.name}
            description={method.description}
          />
        ))}
      </div>

      <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        Online payments are handled securely by Razorpay — card, UPI and banking details are never
        stored on our servers. Choose Cash on Delivery to pay when your order arrives.
      </p>
    </CheckoutSection>
  );
}
