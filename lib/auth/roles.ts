/**
 * Authorization predicates, deliberately free of Next.js imports so the proxy
 * (middleware runtime) can use the same rule as the Server Component guards
 * without pulling `next/navigation` into its bundle.
 */

/** The shape both `@supabase/supabase-js` users and JWT payloads share. */
interface HasAppMetadata {
  readonly app_metadata?: { readonly role?: string } & Record<string, unknown>;
}

/**
 * Whether a signed-in user may use the admin area.
 *
 * The claim lives in `app_metadata`, which only the service-role key can write —
 * a user cannot grant it to themselves. `user_metadata` is self-editable
 * (a customer can set `role: "admin"` on it at will) and is therefore never
 * consulted here. Being authenticated is not enough: storefront customers are
 * authenticated too.
 */
export function isAdminUser(user: HasAppMetadata): boolean {
  return user.app_metadata?.role === "admin";
}
