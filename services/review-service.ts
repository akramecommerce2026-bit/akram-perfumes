import { reviewRecords } from "@/lib/reviews";
import type { Review } from "@/types/review";

/**
 * Review read layer. UI fetches reviews through this async service (mirroring a
 * future Supabase query) rather than importing mock data, so the source can be
 * swapped without touching any component.
 */
export function getProductReviews(productId: string): Promise<readonly Review[]> {
  const reviews = reviewRecords
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return Promise.resolve(reviews);
}
