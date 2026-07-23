import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/account/AuthShell";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a New Password — Akram Perfumes",
  robots: { index: false },
};

/**
 * Reached from a recovery link via /auth/callback, which establishes the session
 * first. Without that session there is nothing to update, so an arrival here
 * without one means the link was skipped, expired, or already used.
 */
export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/error?code=access_denied");

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
