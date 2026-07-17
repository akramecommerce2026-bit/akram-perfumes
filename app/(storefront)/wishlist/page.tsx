import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import { PageHeader } from "@/components/common/page-header";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist — Akram Perfumes",
  description: "Your saved Akram Perfumes fragrances.",
};

export default function WishlistPage() {
  return (
    <div className="py-10 lg:py-14">
      <Container>
        <PageHeader
          eyebrow="Saved for later"
          title="Wishlist"
        />
        <WishlistView />
      </Container>
    </div>
  );
}
