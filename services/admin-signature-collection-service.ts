import "server-only";

import type { SignatureCollectionFormValues } from "@/lib/admin/signature-collection-schema";
import type { AdminSignatureCollectionRepository } from "@/services/repositories/admin-signature-collection-repository";
import { SupabaseAdminSignatureCollectionRepository } from "@/services/repositories/supabase-admin-signature-collection-repository";
import type { AdminSignatureCollection } from "@/types/signature-collection";

/**
 * Admin service for the homepage Signature section. Depends only on the
 * AdminSignatureCollectionRepository abstraction; consumed by server actions and
 * admin Server Components (server-only).
 */
export class AdminSignatureCollectionService {
  constructor(private readonly repository: AdminSignatureCollectionRepository) {}

  list(): Promise<readonly AdminSignatureCollection[]> {
    return this.repository.list();
  }

  getById(id: string): Promise<AdminSignatureCollection | null> {
    return this.repository.getById(id);
  }

  create(input: SignatureCollectionFormValues): Promise<string> {
    return this.repository.create(input);
  }

  update(id: string, input: SignatureCollectionFormValues): Promise<void> {
    return this.repository.update(id, input);
  }

  delete(id: string): Promise<void> {
    return this.repository.softDelete(id);
  }
}

export const adminSignatureCollectionService = new AdminSignatureCollectionService(
  new SupabaseAdminSignatureCollectionRepository(),
);
