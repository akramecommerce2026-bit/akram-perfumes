import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { AuthShell } from "@/components/account/AuthShell";

export const metadata: Metadata = {
  title: "Link Problem — Akram Perfumes",
  robots: { index: false },
};

interface AuthErrorPageProps {
  searchParams: Promise<{ code?: string; description?: string }>;
}

/**
 * Where /auth/callback sends a visitor whose email link didn't work. The common
 * cases are an expired or already-used link, which are recoverable — so each one
 * names the problem and points at the page that issues a fresh link.
 */
export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { code, description } = await searchParams;
  const { title, message, action } = describe(code, description);

  return (
    <AuthShell title={title} subtitle={message}>
      <div className="flex flex-col items-center gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <Link
          href={action.href}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-300 hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {action.label}
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-accent-foreground transition-colors hover:text-accent hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

function describe(code: string | undefined, description: string | undefined) {
  switch (code) {
    case "otp_expired":
      return {
        title: "That link has expired",
        message: "Email links are only valid for a short time. Request a new one and we'll send it straight over.",
        action: { href: "/forgot-password", label: "Send a new link" },
      };
    case "access_denied":
      return {
        title: "That link is no longer valid",
        message: "It may have already been used. Request a new one to continue.",
        action: { href: "/forgot-password", label: "Send a new link" },
      };
    case "missing_token":
      return {
        title: "That link looks incomplete",
        message: "Open the link directly from your email, or request a new one.",
        action: { href: "/forgot-password", label: "Send a new link" },
      };
    default:
      return {
        title: "We couldn't verify that link",
        message: description?.trim()
          ? description
          : "Something went wrong opening your link. Requesting a fresh one usually fixes it.",
        action: { href: "/forgot-password", label: "Send a new link" },
      };
  }
}
