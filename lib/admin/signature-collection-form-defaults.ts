import type { SignatureCollectionFormValues } from "@/lib/admin/signature-collection-schema";
import type { AdminSignatureCollection } from "@/types/signature-collection";

export function emptySignatureCollectionFormValues(): SignatureCollectionFormValues {
  return {
    title: "",
    subtitle: "",
    description: "",
    backgroundImage: "",
    collectionImage: "",
    buttonText: "",
    buttonUrl: "",
    displayOrder: 0,
    active: true,
  };
}

export function toSignatureCollectionFormValues(
  detail: AdminSignatureCollection,
): SignatureCollectionFormValues {
  return {
    title: detail.title,
    subtitle: detail.subtitle,
    description: detail.description,
    backgroundImage: detail.backgroundImage,
    collectionImage: detail.collectionImage,
    buttonText: detail.buttonText,
    buttonUrl: detail.buttonUrl,
    displayOrder: detail.displayOrder,
    active: detail.active,
  };
}
