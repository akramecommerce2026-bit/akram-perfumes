import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";

/**
 * Refreshes the Supabase session on every admin request and guards the admin
 * area:
 *  - unauthenticated users hitting any /admin route (except the login page) are
 *    redirected to /admin/login — they can never reach the dashboard;
 *  - authenticated users hitting /admin/login are sent straight to /admin.
 *
 * This runs before the pages render (defense in depth alongside the layout's
 * server-side `requireAdmin`). Uses the Next 16 `proxy` file convention (the
 * former `middleware` name).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If Supabase isn't configured, don't block — the admin simply can't be used.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === LOGIN_PATH;

  if (!user && !isLoginPage) {
    const redirectUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
