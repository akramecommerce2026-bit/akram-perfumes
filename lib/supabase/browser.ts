import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Browser Supabase client for authentication in Client Components (login,
 * logout). Unlike the catalogue read client (`getSupabaseClient`), this one
 * persists the session in cookies via `@supabase/ssr`, so the middleware and
 * Server Components can read it. Cached as a singleton per tab.
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
