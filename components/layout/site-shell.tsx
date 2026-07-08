import type { ReactNode } from "react";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/cart-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <CartProvider>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
