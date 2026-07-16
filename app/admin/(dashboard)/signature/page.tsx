import { SignatureCollectionsManager } from "@/components/admin/signature/SignatureCollectionsManager";
import { adminSignatureCollectionService } from "@/services/admin-signature-collection-service";

export default async function AdminSignaturePage() {
  const items = await adminSignatureCollectionService.list();

  return <SignatureCollectionsManager items={items} />;
}
