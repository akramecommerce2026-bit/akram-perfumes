import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SignatureCollectionRepository } from "@/services/repositories/signature-collection-repository";
import { SupabaseSignatureCollectionRepository } from "@/services/repositories/supabase-signature-collection-repository";
import type { SignatureCollection } from "@/types/signature-collection";

/**
 * Storefront service for the homepage Signature section.
 *
 * The homepage must never fail on a CMS read, so an unavailable backend (env not
 * configured, table not provisioned yet, network blip) yields an empty list and
 * the section simply doesn't render — the rest of the page is unaffected.
 */
export class SignatureCollectionService {
  constructor(private readonly repository: SignatureCollectionRepository | null) {}

  async listActive(): Promise<readonly SignatureCollection[]> {
    if (!this.repository) return [];
    try {
      return await this.repository.listActive();
    } catch (error) {
      console.error("[signature-collections] read failed:", error);
      return [];
    }
  }
}

export const signatureCollectionService = new SignatureCollectionService(
  isSupabaseConfigured() ? new SupabaseSignatureCollectionRepository() : null,
);
