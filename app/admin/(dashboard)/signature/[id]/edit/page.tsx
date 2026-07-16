import { notFound } from "next/navigation";

import { SignatureCollectionForm } from "@/components/admin/signature/SignatureCollectionForm";
import { toSignatureCollectionFormValues } from "@/lib/admin/signature-collection-form-defaults";
import { adminSignatureCollectionService } from "@/services/admin-signature-collection-service";

interface EditSignatureCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSignatureCollectionPage({
  params,
}: EditSignatureCollectionPageProps) {
  const { id } = await params;
  const collection = await adminSignatureCollectionService.getById(id);
  if (!collection) notFound();

  return (
    <SignatureCollectionForm
      mode="edit"
      collectionId={collection.id}
      defaultValues={toSignatureCollectionFormValues(collection)}
    />
  );
}
