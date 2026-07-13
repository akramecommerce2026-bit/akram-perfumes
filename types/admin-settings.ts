/** Admin-editable store configuration (persisted as one JSONB document). */
export interface StoreSettings {
  readonly storeName: string;
  readonly storeDescription: string;
  readonly currency: string;
  readonly timezone: string;
  readonly language: string;
  readonly business: {
    readonly name: string;
    readonly address: string;
    readonly phone: string;
    readonly email: string;
  };
  readonly gstNumber: string;
  readonly shippingCharge: number;
  readonly freeShippingThreshold: number;
  readonly defaultTaxPercent: number;
  readonly codEnabled: boolean;
  readonly social: {
    readonly instagram: string;
    readonly facebook: string;
    readonly whatsapp: string;
    readonly youtube: string;
  };
  readonly seo: {
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly ogImage: string;
    readonly robots: string;
    readonly canonicalUrl: string;
  };
}
