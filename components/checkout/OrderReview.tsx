"use client";

import { motion } from "framer-motion";
import { MapPin, Pencil, Wallet } from "lucide-react";

import { PAYMENT_OPTIONS } from "@/lib/checkout";
import type { CheckoutFormValues } from "@/lib/checkout-schema";

interface OrderReviewProps {
  values: CheckoutFormValues;
  onEdit: () => void;
}

/**
 * Read-only confirmation of the entered details, shown before the order is
 * placed. Purely presentational — edits go back to the form via `onEdit`.
 */
export function OrderReview({ values, onEdit }: OrderReviewProps) {
  const payment = PAYMENT_OPTIONS.find((option) => option.id === values.paymentMethod);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">Review your order</h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </button>
      </div>

      <ReviewCard icon={<MapPin className="size-4" aria-hidden="true" />} title="Shipping to">
        <p className="font-medium text-foreground">{values.fullName}</p>
        <p>{values.mobile} · {values.email}</p>
        <p>
          {[values.line1, values.line2, values.landmark].filter(Boolean).join(", ")}
        </p>
        <p>
          {values.city}, {values.state} {values.pincode}, {values.country}
        </p>
      </ReviewCard>

      <ReviewCard icon={<Wallet className="size-4" aria-hidden="true" />} title="Payment">
        <p className="font-medium text-foreground">{payment?.name}</p>
        <p>{payment?.description}</p>
      </ReviewCard>
    </motion.div>
  );
}

function ReviewCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-accent-foreground uppercase">
        <span className="text-accent">{icon}</span>
        {title}
      </div>
      <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
