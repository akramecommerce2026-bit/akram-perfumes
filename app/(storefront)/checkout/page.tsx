import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = {
  title: "Checkout — Akram Perfumes",
  description: "Complete your Akram Perfumes order with secure, encrypted checkout.",
};

export default function CheckoutPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Almost There"
          title="Checkout"
        />

        {/* Bottom padding leaves room for the mobile sticky action bar. */}
        <div className="pb-24 md:pb-0">
          <CheckoutForm />
        </div>
      </Container>
    </div>
  );
}
