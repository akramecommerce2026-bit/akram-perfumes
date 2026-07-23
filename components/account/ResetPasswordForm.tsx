"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const inputBase =
  "h-11 w-full rounded-lg border bg-background pr-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Sets a new password. Reached only from a recovery link, which /auth/callback
 * has already exchanged for a session — so `updateUser` applies to the recovering
 * account without ever asking for the forgotten password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await getSupabaseBrowserClient().auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        New password
        <span className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Create a new password"
            className={cn(inputBase, "border-border px-10 focus-visible:border-accent")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Confirm new password
        <span className="relative">
          <Lock
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            name="confirm"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Repeat your new password"
            className={cn(inputBase, "border-border pl-10 focus-visible:border-accent")}
          />
        </span>
      </label>

      <Button type="submit" disabled={loading} className="h-11 rounded-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
          </>
        ) : (
          "Update password"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-accent-foreground hover:text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
