import { getSupabaseClient, type AkramSupabaseClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import type { SignatureCollectionRepository } from "@/services/repositories/signature-collection-repository";
import type { SignatureCollection } from "@/types/signature-collection";

/**
 * Supabase-backed storefront repository for the Signature section. RLS already
 * limits the anon client to active, non-deleted rows; the filters are repeated
 * here for clarity and so ordering is explicit.
 */
export class SupabaseSignatureCollectionRepository implements SignatureCollectionRepository {
  private get db(): AkramSupabaseClient {
    return getSupabaseClient();
  }

  async listActive(): Promise<readonly SignatureCollection[]> {
    const { data, error } = await this.db
      .from("signature_collections")
      .select("*")
      .eq("active", true)
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapSignatureCollection);
  }
}

export function mapSignatureCollection(row: Tables<"signature_collections">): SignatureCollection {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    backgroundImage: row.background_image ?? "",
    collectionImage: row.collection_image ?? "",
    buttonText: row.button_text ?? "",
    buttonUrl: row.button_url ?? "",
  };
}
