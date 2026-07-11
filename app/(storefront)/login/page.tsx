import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/account/AuthShell";
import { CustomerAuthForm } from "@/components/account/CustomerAuthForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign In — Akram Perfumes",
  robots: { index: false },
};

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Akram Perfumes account.">
      <CustomerAuthForm mode="login" />
    </AuthShell>
  );
}
