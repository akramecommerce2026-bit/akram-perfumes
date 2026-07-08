"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Truck } from "lucide-react";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { SelectableCard } from "@/components/checkout/SelectableCard";
import { DELIVERY_OPTIONS, resolveShippingFee } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";
import { formatMoney } from "@/lib/money";

/**
 * Delivery tier selector. Options are data-driven from DELIVERY_OPTIONS, and the
 * displayed fee reflects the live subtotal (free-shipping rule applied).
 */
export function DeliveryOptions({ subtotalAmount }: { subtotalAmount: number }) {
  const { register, control } = useFormContext<CheckoutFormValues>();
  const selected = useWatch({ control, name: "deliveryMethod" });

  return (
    <CheckoutSection step={3} title="Delivery Method">
      <div className="flex flex-col gap-3">
        {DELIVERY_OPTIONS.map((option) => {
          const fee = resolveShippingFee(subtotalAmount, option.id);
          return (
            <SelectableCard
              key={option.id}
              value={option.id}
              checked={selected === option.id}
              register={register("deliveryMethod")}
              icon={<Truck className="size-5" aria-hidden="true" />}
              title={option.name}
              description={`${option.estimate} · ${option.description}`}
              trailing={
                <span className="text-sm font-medium text-foreground">
                  {fee === 0 ? "Free" : formatMoney({ amount: fee, currency: "INR" })}
                </span>
              }
            />
          );
        })}
      </div>
    </CheckoutSection>
  );
}
