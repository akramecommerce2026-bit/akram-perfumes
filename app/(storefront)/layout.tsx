import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";

/**
 * Storefront chrome (announcement bar, navbar, footer, cart) for all customer-
 * facing routes. Lives in the `(storefront)` route group so the admin area —
 * a sibling route group — renders without it. The group does not affect URLs.
 *
 * `storefront-theme` scopes the customer-facing type and palette to this subtree
 * (see globals.css); the admin renders outside it and is unaffected.
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="storefront-theme flex min-h-full flex-col">
      <SiteShell>{children}</SiteShell>
    </div>
  );
}
