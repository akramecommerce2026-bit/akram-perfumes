import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";

export const metadata: Metadata = {
  title: "Your Cart — Akram Perfumes",
  description: "Review your selected Akram Perfumes fragrances and proceed to a secure checkout.",
};

export default function CartPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Your Selection"
          title="Shopping Cart"
        />

        <CartView />
      </Container>
    </div>
  );
}
