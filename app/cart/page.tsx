import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/common/container";

export const metadata: Metadata = {
  title: "Your Cart — Akram Perfumes",
  description: "Review your selected Akram Perfumes fragrances and proceed to a secure checkout.",
};

export default function CartPage() {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Your Selection</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
            Shopping Cart
          </h1>
        </header>

        <CartView />
      </Container>
    </div>
  );
}
