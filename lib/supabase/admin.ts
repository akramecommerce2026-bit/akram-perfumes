import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { getServiceRoleKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Privileged, service-role Supabase client. Bypasses RLS — use ONLY on the
 * server for trusted operations (seeding, order writes after Razorpay
 * verification, admin tooling).
 *
 * The `server-only` import makes the build fail if this module is ever pulled
 * into a client bundle, preventing the service-role key from leaking.
 */
let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!adminClient) {
    adminClient = createClient<Database>(supabaseUrl, getServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
