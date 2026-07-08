import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/common/container";

export const metadata: Metadata = {
  title: "Checkout — Akram Perfumes",
  description: "Complete your Akram Perfumes order with secure, encrypted checkout.",
};

export default function CheckoutPage() {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Almost There</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Checkout
          </h1>
        </header>

        {/* Bottom padding leaves room for the mobile sticky action bar. */}
        <div className="pb-24 md:pb-0">
          <CheckoutForm />
        </div>
      </Container>
    </div>
  );
}
