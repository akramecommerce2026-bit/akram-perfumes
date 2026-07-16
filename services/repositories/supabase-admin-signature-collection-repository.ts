import "server-only";

import type { SignatureCollectionFormValues } from "@/lib/admin/signature-collection-schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import type { AdminSignatureCollectionRepository } from "@/services/repositories/admin-signature-collection-repository";
import type { AdminSignatureCollection } from "@/types/signature-collection";

/**
 * Supabase-backed admin repository for the homepage Signature section
 * (service-role, server-only). Unlike the storefront repository it also returns
 * hidden rows, so the admin can manage what customers don't see.
 */
export class SupabaseAdminSignatureCollectionRepository
  implements AdminSignatureCollectionRepository
{
  private get db() {
    return getSupabaseAdminClient();
  }

  async list(): Promise<readonly AdminSignatureCollection[]> {
    const { data, error } = await this.db
      .from("signature_collections")
      .select("*")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAdminSignatureCollection);
  }

  async getById(id: string): Promise<AdminSignatureCollection | null> {
    const { data, error } = await this.db
      .from("signature_collections")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data ? mapAdminSignatureCollection(data) : null;
  }

  async create(input: SignatureCollectionFormValues): Promise<string> {
    const id = `sig_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const { error } = await this.db
      .from("signature_collections")
      .insert({ id, ...toRow(input) });
    if (error) throw error;
    return id;
  }

  async update(id: string, input: SignatureCollectionFormValues): Promise<void> {
    const { error } = await this.db
      .from("signature_collections")
      .update(toRow(input))
      .eq("id", id);
    if (error) throw error;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.db
      .from("signature_collections")
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq("id", id);
    if (error) throw error;
  }
}

/** Form values → column values. Empty optional text is stored as NULL. */
function toRow(input: SignatureCollectionFormValues): Omit<TablesInsert<"signature_collections">, "id"> {
  return {
    title: input.title,
    subtitle: input.subtitle || null,
    description: input.description || null,
    background_image: input.backgroundImage || null,
    collection_image: input.collectionImage || null,
    button_text: input.buttonText || null,
    button_url: input.buttonUrl || null,
    display_order: input.displayOrder,
    active: input.active,
  };
}

function mapAdminSignatureCollection(
  row: Tables<"signature_collections">,
): AdminSignatureCollection {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    backgroundImage: row.background_image ?? "",
    collectionImage: row.collection_image ?? "",
    buttonText: row.button_text ?? "",
    buttonUrl: row.button_url ?? "",
    displayOrder: row.display_order,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
