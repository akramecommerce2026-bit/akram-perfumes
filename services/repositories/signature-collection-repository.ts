import type { SignatureCollection } from "@/types/signature-collection";

/**
 * Storefront read contract for the homepage Signature section (Dependency
 * Inversion). Implemented by the Supabase anon-client repository; admin writes
 * live behind AdminSignatureCollectionRepository.
 */
export interface SignatureCollectionRepository {
  /** Active, non-deleted sections in display order. */
  listActive(): Promise<readonly SignatureCollection[]>;
}
