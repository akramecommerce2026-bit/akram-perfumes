"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const inputBase =
  "h-11 w-full rounded-lg border bg-background pr-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function CustomerAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "").trim();

    if (isRegister && name.length < 1) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    if (isRegister) {
      const { data: result, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          // Confirmation links must land on the callback, which establishes the
          // session before forwarding — /account alone can't exchange the token.
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // If email confirmation is required, there is no session yet.
      if (!result.session) {
        setNotice("Check your inbox to confirm your email, then sign in.");
        return;
      }
      router.replace("/account");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : signInError.message,
      );
      return;
    }
    router.replace("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {notice && (
        <p className="flex items-start gap-2 rounded-lg border border-accent/30 bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-4 py-3 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span>{notice}</span>
        </p>
      )}

      {isRegister && (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Name
          <span className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input name="name" autoComplete="name" placeholder="Your name" className={cn(inputBase, "border-border pl-10 focus-visible:border-accent")} />
          </span>
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Email
        <span className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={cn(inputBase, "border-border pl-10 focus-visible:border-accent")} />
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
        Password
        <span className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "Create a password" : "••••••••"}
            className={cn(inputBase, "border-border px-10 focus-visible:border-accent")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </span>
      </label>

      {!isRegister && (
        <div className="flex justify-end -mt-2">
          <Link href="/forgot-password" className="text-sm font-medium text-accent-foreground hover:text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
      )}

      <Button type="submit" disabled={loading} className="h-11 rounded-full">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Please wait…
          </>
        ) : isRegister ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? "Already have an account? " : "New to Akram Perfumes? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-accent-foreground hover:text-accent hover:underline">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
