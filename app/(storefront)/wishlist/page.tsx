import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist — Akram Perfumes",
  description: "Your saved Akram Perfumes fragrances.",
};

export default function WishlistPage() {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 lg:mb-10">
          <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">Saved for later</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">Wishlist</h1>
        </header>
        <WishlistView />
      </Container>
    </div>
  );
}
