import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { TrackLookup } from "@/components/shipment/TrackLookup";

export const metadata: Metadata = {
  title: "Track Your Order — Akram Perfumes",
  description: "Enter your order number to see live shipment status and delivery updates.",
};

export default function TrackOrderPage() {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col gap-6 text-center">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Order Tracking</p>
            <h1 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter the order number from your confirmation email to see live shipment status,
              courier details and estimated delivery.
            </p>
          </div>
          <TrackLookup />
        </div>
      </Container>
    </div>
  );
}
