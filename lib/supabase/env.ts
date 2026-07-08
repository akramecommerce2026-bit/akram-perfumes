/**
 * Centralized, validated access to Supabase environment variables.
 *
 * Keys are never hardcoded — they come from the environment:
 *   NEXT_PUBLIC_SUPABASE_URL       (public, browser-safe)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (public, browser-safe, RLS-protected)
 *   SUPABASE_SERVICE_ROLE_KEY      (SECRET, server-only — bypasses RLS)
 *
 * `isSupabaseConfigured()` lets the data layer fall back to mock data when the
 * backend isn't configured (e.g. local dev / CI without secrets), so the app
 * always builds and runs.
 */

/**
 * Normalize the project URL to the bare origin that supabase-js expects.
 *
 * Supabase's dashboard shows both the Project URL (correct) and the REST
 * endpoint (`.../rest/v1/`); pasting the latter — or leaving a trailing slash —
 * would make the client build a doubled path (PGRST125). Stripping it here keeps
 * the client working regardless of which URL variant is configured.
 */
function normalizeSupabaseUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/, "")
    .replace(/\/+$/, "");
}

export const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** True when the public Supabase credentials are present. */
export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

/**
 * Returns the service-role key, or throws if missing. Server-only: importing
 * this into client code would leak a secret, so callers must run on the server.
 */
export function getServiceRoleKey(): string {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. It is required for privileged server-side operations.",
    );
  }
  return key;
}
