import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export type AkramSupabaseClient = SupabaseClient<Database>;

let client: AkramSupabaseClient | null = null;

/**
 * Shared, typed Supabase client using the public anon key.
 *
 * Safe on both server and client: it only ever sees RLS-protected data. Reads
 * (catalogue) run through this. Returns a cached singleton. Throws if Supabase
 * isn't configured — callers that must degrade gracefully should gate on
 * `isSupabaseConfigured()` first (the repository factory does exactly this).
 */
export function getSupabaseClient(): AkramSupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
