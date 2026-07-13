import "server-only";

import { DEFAULT_SETTINGS } from "@/lib/admin/settings-defaults";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import type { StoreSettings } from "@/types/admin-settings";

/**
 * Read/write the single store_settings document (service-role, server-only).
 * Reads degrade to defaults if the row is empty or the table isn't provisioned
 * yet, so the Settings page always renders with real, sensible values.
 */
export const settingsService = {
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const { data, error } = await getSupabaseAdminClient()
        .from("store_settings")
        .select("data")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      const stored = (data?.data ?? {}) as Partial<StoreSettings>;
      return mergeSettings(stored);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveStoreSettings(settings: StoreSettings): Promise<void> {
    const { error } = await getSupabaseAdminClient()
      .from("store_settings")
      .upsert({ id: 1, data: settings as unknown as Json });
    if (error) throw error;
  },
};

/** Merge stored settings over defaults (nested objects merged one level deep). */
function mergeSettings(stored: Partial<StoreSettings>): StoreSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    business: { ...DEFAULT_SETTINGS.business, ...(stored.business ?? {}) },
    social: { ...DEFAULT_SETTINGS.social, ...(stored.social ?? {}) },
    seo: { ...DEFAULT_SETTINGS.seo, ...(stored.seo ?? {}) },
  };
}
