"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { NavActions } from "@/components/layout/nav-actions";
import { MobileMenu } from "@/components/layout/mobile-menu";

/**
 * Storefront header.
 *
 * Structure follows the design benchmark: a single row that stays put — menu on
 * the left, brand optically centred, actions on the right — at every breakpoint.
 * The catalogue lives behind the menu rather than as an inline bar, which keeps
 * the row quiet and lets the brand hold the centre.
 *
 * It is opaque and always visible rather than fading in on scroll: a header that
 * hides and reappears fights the calm the rest of the page is going for, and the
 * actions (search, cart) should never be a scroll away.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <Container>
          <div className="relative flex h-16 items-center justify-between md:h-18">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="-ml-2"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>

            {/* Absolutely centred so the brand sits mid-header regardless of how
                wide the flanking controls get. */}
            <div className="pointer-events-none absolute inset-x-0 flex justify-center">
              <Logo className="pointer-events-auto" />
            </div>

            <NavActions className="-mr-2" />
          </div>
        </Container>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
