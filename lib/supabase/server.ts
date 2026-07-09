import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Server Supabase client bound to the request cookies, for reading the
 * authenticated session in Server Components, Route Handlers and Server Actions.
 * Session refresh cookies are written by the middleware; the try/catch guards
 * the read-only cookie store present in Server Components.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies are read-only — safe to
          // ignore; the middleware refreshes the session cookie on each request.
        }
      },
    },
  });
}
