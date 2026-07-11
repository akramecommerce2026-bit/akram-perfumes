import type { AnalyticsDashboard, ResolvedRange } from "@/types/admin-analytics";

/**
 * Read contract for the admin analytics dashboard. A single call returns the
 * full, already-aggregated payload for one date window so the page fetches once.
 */
export interface AdminAnalyticsRepository {
  getDashboard(range: ResolvedRange): Promise<AnalyticsDashboard>;
}

export const BEST_SELLERS_LIMIT = 10;
export const RECENT_ORDERS_LIMIT = 10;
export const ACTIVITY_LIMIT = 12;
