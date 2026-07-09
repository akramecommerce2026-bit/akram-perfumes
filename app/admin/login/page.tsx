import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminUser } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin Login — Akram Perfumes",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in → straight to the dashboard.
  const admin = await getAdminUser();
  if (admin) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <LoginForm />
    </main>
  );
}
