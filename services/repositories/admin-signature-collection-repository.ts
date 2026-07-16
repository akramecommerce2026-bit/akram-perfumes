import type { SignatureCollectionFormValues } from "@/lib/admin/signature-collection-schema";
import type { AdminSignatureCollection } from "@/types/signature-collection";

/**
 * Write + read contract for admin management of the homepage Signature section
 * (Dependency Inversion). Mirrors AdminCategoryRepository. Implemented by the
 * Supabase service-role repository.
 */
export interface AdminSignatureCollectionRepository {
  /** Every non-deleted section (active and hidden), in display order. */
  list(): Promise<readonly AdminSignatureCollection[]>;
  getById(id: string): Promise<AdminSignatureCollection | null>;
  create(input: SignatureCollectionFormValues): Promise<string>;
  update(id: string, input: SignatureCollectionFormValues): Promise<void>;
  /** Soft delete: sets deleted_at + hides, so the storefront drops it at once. */
  softDelete(id: string): Promise<void>;
}
