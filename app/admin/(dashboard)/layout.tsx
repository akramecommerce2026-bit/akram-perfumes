import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin — Akram Perfumes",
  robots: { index: false, follow: false },
};

// Session-dependent: always render per request, never statically.
export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Server-side guard (defense in depth with the middleware): unauthenticated
  // visitors are redirected to /admin/login and never see admin content.
  const admin = await requireAdmin();

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AdminShell adminName={admin.name} adminInitials={admin.initials} dateLabel={dateLabel}>
      {children}
    </AdminShell>
  );
}
