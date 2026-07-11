import type { Metadata } from "next";

import { AuthShell } from "@/components/account/AuthShell";
import { ForgotPasswordForm } from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — Akram Perfumes",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure link to set a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
