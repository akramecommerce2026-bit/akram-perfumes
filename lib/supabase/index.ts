/**
 * Public entry point for the Supabase integration layer.
 *
 * App code imports clients/config from here. The admin client is intentionally
 * NOT re-exported — import it directly from `@/lib/supabase/admin` in
 * server-only code so it never risks entering a client bundle.
 */
export { getSupabaseClient, type AkramSupabaseClient } from "@/lib/supabase/client";
export { isSupabaseConfigured } from "@/lib/supabase/env";
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";
