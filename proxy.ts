import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminUser } from "@/lib/auth/roles";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

const LOGIN_PATH = "/admin/login";

/**
 * Refreshes the Supabase session on every matched request and guards the admin
 * area:
 *  - unauthenticated users hitting any /admin route (except the login page) are
 *    redirected to /admin/login — they can never reach the dashboard;
 *  - signed-in users without the admin claim are sent to the storefront: being
 *    authenticated as a customer must not open the admin;
 *  - admins hitting /admin/login are sent straight to /admin.
 *
 * Non-admin routes are matched only so the refreshed session cookie is written
 * back here (a Server Component can read cookies but not persist rotated ones);
 * they are never redirected. This runs before pages render, as defense in depth
 * alongside each page's own server-side guard. Uses the Next 16 `proxy` file
 * convention (the former `middleware` name).
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

  // Also refreshes an expired access token; setAll above persists the rotation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Everything outside /admin only needed the refresh above.
  if (!pathname.startsWith("/admin")) {
    return response;
  }

  const isLoginPage = pathname === LOGIN_PATH;

  if (!user) {
    if (isLoginPage) return response;
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (!isAdminUser(user)) {
    // Signed in, but as a customer: authenticated is not authorized.
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/reset-password",
    "/checkout/:path*",
  ],
};
