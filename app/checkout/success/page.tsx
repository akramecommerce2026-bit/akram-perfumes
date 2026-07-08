import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SuccessView } from "@/components/checkout/SuccessView";
import { Container } from "@/components/common/container";

export const metadata: Metadata = {
  title: "Order Confirmed — Akram Perfumes",
  description: "Your Akram Perfumes order has been confirmed.",
  robots: { index: false },
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams;

  // Reaching this page without an order number means a stray/refreshed visit.
  if (!order) redirect("/");

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <SuccessView orderNumber={order} />
      </Container>
    </div>
  );
}
