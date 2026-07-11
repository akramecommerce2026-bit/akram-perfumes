import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/account/AuthShell";
import { CustomerAuthForm } from "@/components/account/CustomerAuthForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create Account — Akram Perfumes",
  robots: { index: false },
};

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <AuthShell title="Create your account" subtitle="Save your details, track orders and build a wishlist.">
      <CustomerAuthForm mode="register" />
    </AuthShell>
  );
}
