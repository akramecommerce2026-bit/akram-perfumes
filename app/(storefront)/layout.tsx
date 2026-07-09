import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";

/**
 * Storefront chrome (announcement bar, navbar, footer, cart) for all customer-
 * facing routes. Lives in the `(storefront)` route group so the admin area —
 * a sibling route group — renders without it. The group does not affect URLs.
 */
export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
