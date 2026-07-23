"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      // The callback turns the recovery token into a session, then hands off to
      // the page that actually sets the new password.
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-accent">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&rsquo;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-medium text-accent-foreground hover:text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Email
        <span className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 w-full rounded-lg border border-border bg-background pr-3.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </span>
      </label>
      <Button type="submit" disabled={loading} className="h-11 rounded-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-accent-foreground hover:text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
