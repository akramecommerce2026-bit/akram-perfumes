/**
 * The homepage Signature Collection section, authored in the admin.
 *
 * Every field the storefront renders lives here — no copy, image or link is
 * hardcoded in the component. Optional fields are empty strings when unset, and
 * the section degrades gracefully around them (e.g. no button without a label).
 */
export interface SignatureCollection {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  /** Decorative section backdrop; the gradient shows through when empty. */
  readonly backgroundImage: string;
  /** The product/bottle image shown beside the copy. */
  readonly collectionImage: string;
  readonly buttonText: string;
  readonly buttonUrl: string;
}

/** Admin read model — adds the fields only the manager screen needs. */
export interface AdminSignatureCollection extends SignatureCollection {
  readonly displayOrder: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
