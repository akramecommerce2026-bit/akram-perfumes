"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Signs the admin out from the server, where the session cookie can be reliably
 * expired via the cookie writer (the browser client can't always clear the SSR
 * cookie the proxy reads). Redirects to the login page afterwards.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Storefront customer sign-out. Same server-side cookie clearing as the admin
 * variant, but returns the customer to the home page.
 */
export async function signOutCustomerAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
