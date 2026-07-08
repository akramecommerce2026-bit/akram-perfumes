/**
 * A customer testimonial.
 *
 * Shaped to map cleanly onto a future Supabase `testimonials` table so the UI
 * can switch from mock data to live, admin-managed reviews without any redesign.
 * Avatars are rendered from `name` initials — no photo field — so real customer
 * data can be dropped in later without sourcing imagery.
 */
export interface Testimonial {
  readonly id: string;
  readonly name: string;
  /** 1–5. */
  readonly rating: number;
  readonly verified: boolean;
  /** Product the review is about — optional. */
  readonly product?: string;
  readonly review: string;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
}
