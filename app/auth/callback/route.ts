import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The single landing point for every Supabase email link (confirm sign-up,
 * password recovery, email change). It establishes the session and forwards the
 * visitor to `next`.
 *
 * Two link shapes are accepted, because which one arrives depends on the email
 * template configured in the dashboard:
 *
 *  - `?token_hash=&type=` — from a `{{ .TokenHash }}` template. Verified with
 *    `verifyOtp`, which works even when the link is opened in a different
 *    browser from the one that requested it.
 *  - `?code=` — from the default `{{ .ConfirmationURL }}` template under the
 *    PKCE flow. Exchanged for a session; this requires the code verifier cookie
 *    set when the link was requested, so it only works in the same browser.
 *
 * Supabase itself redirects here with `?error=` when a link is expired or
 * already used; that is surfaced as a readable message rather than a dead end.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  // Only ever redirect to a path on this site — never to an attacker-supplied
  // absolute URL (open-redirect guard).
  const requestedNext = searchParams.get("next") ?? "/account";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  if (error) {
    return NextResponse.redirect(
      toErrorUrl(origin, errorCode ?? error, errorDescription),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!verifyError) return NextResponse.redirect(new URL(next, origin));
    return NextResponse.redirect(toErrorUrl(origin, verifyError.code, verifyError.message));
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) return NextResponse.redirect(new URL(next, origin));
    return NextResponse.redirect(toErrorUrl(origin, exchangeError.code, exchangeError.message));
  }

  return NextResponse.redirect(toErrorUrl(origin, "missing_token", "The link is missing its token."));
}

function toErrorUrl(origin: string, code: string | undefined, description: string | null): URL {
  const url = new URL("/auth/error", origin);
  if (code) url.searchParams.set("code", code);
  if (description) url.searchParams.set("description", description);
  return url;
}
