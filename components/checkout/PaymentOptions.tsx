"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Banknote, CreditCard, Landmark, Smartphone, type LucideIcon } from "lucide-react";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { SelectableCard } from "@/components/checkout/SelectableCard";
import { PAYMENT_OPTIONS } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";
import type { PaymentMethodId } from "@/types/checkout";

const PAYMENT_ICONS: Record<PaymentMethodId, LucideIcon> = {
  razorpay: Banknote,
  upi: Smartphone,
  card: CreditCard,
  netbanking: Landmark,
};

/**
 * Payment method selector — presentational only for V1 (no gateway). Options are
 * data-driven so wiring Razorpay later means implementing the handler, not
 * rebuilding this UI.
 */
export function PaymentOptions() {
  const { register, control } = useFormContext<CheckoutFormValues>();
  const selected = useWatch({ control, name: "paymentMethod" });

  return (
    <CheckoutSection step={4} title="Payment Method" description="Secured payments — no charge until you confirm.">
      <div className="flex flex-col gap-3">
        {PAYMENT_OPTIONS.map((option) => {
          const Icon = PAYMENT_ICONS[option.id];
          return (
            <SelectableCard
              key={option.id}
              value={option.id}
              checked={selected === option.id}
              register={register("paymentMethod")}
              icon={<Icon className="size-5" aria-hidden="true" />}
              title={option.name}
              description={option.description}
            />
          );
        })}
      </div>
      <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        Payment integration is coming soon. Your order will be confirmed and payment collected on
        delivery or via a secure link.
      </p>
    </CheckoutSection>
  );
}
