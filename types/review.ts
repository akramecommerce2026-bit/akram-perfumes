/**
 * A product review.
 *
 * Shaped to map onto a future Supabase `reviews` table (one row per review,
 * keyed by `productId`) so the Product page can switch from mock data to
 * live, moderated reviews without any UI change.
 */
export interface Review {
  readonly id: string;
  readonly productId: string;
  readonly name: string;
  /** 1–5. */
  readonly rating: number;
  readonly verified: boolean;
  readonly title?: string;
  readonly body: string;
  /** ISO 8601 timestamp. */
  readonly createdAt: string;
}
