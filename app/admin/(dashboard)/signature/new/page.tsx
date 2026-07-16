import { SignatureCollectionForm } from "@/components/admin/signature/SignatureCollectionForm";
import { emptySignatureCollectionFormValues } from "@/lib/admin/signature-collection-form-defaults";

export default function NewSignatureCollectionPage() {
  return (
    <SignatureCollectionForm mode="create" defaultValues={emptySignatureCollectionFormValues()} />
  );
}
