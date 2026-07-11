import "server-only";

import type { AdminAnalyticsRepository } from "@/services/repositories/admin-analytics-repository";
import { SupabaseAdminAnalyticsRepository } from "@/services/repositories/supabase-admin-analytics-repository";
import type { AnalyticsDashboard, ResolvedRange } from "@/types/admin-analytics";

/**
 * Read service for the admin analytics dashboard. Depends only on the
 * AdminAnalyticsRepository abstraction; consumed by the analytics Server
 * Component (server-only).
 */
export class AdminAnalyticsService {
  constructor(private readonly repository: AdminAnalyticsRepository) {}

  getDashboard(range: ResolvedRange): Promise<AnalyticsDashboard> {
    return this.repository.getDashboard(range);
  }
}

export const adminAnalyticsService = new AdminAnalyticsService(new SupabaseAdminAnalyticsRepository());
