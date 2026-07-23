import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { isAdminUser } from "@/lib/auth/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export { isAdminUser };

/** The authenticated admin, resolved from the request session. */
export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly initials: string;
}

/** Returns the current admin, or null when unauthenticated or not an admin. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) return null;
  return toAdminUser(user);
}

/**
 * Server-side guard for admin pages. Redirects to the login page when there is
 * no session, so a Server Component can never render admin content to an
 * unauthenticated visitor. Complements the middleware.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}

function toAdminUser(user: User): AdminUser {
  const email = user.email ?? "";
  const metadataName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined);
  const name = metadataName?.trim() || deriveNameFromEmail(email);
  return { id: user.id, email, name, initials: initialsOf(name) };
}

function deriveNameFromEmail(email: string): string {
  const handle = email.split("@")[0] ?? "Admin";
  return handle
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Admin";
}

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
