import { BUSINESS, SOCIAL_LINKS } from "@/lib/site";
import type { StoreSettings } from "@/types/admin-settings";

const socialByLabel = new Map(SOCIAL_LINKS.map((s) => [s.label.toLowerCase(), s.href]));

/**
 * Sensible defaults, derived from the existing single source of truth
 * (lib/site business details). Used when the store_settings row is empty (or the
 * table isn't provisioned yet). Delivery is free and Razorpay is the only
 * payment method, so the shipping/COD defaults are zeroed out.
 */
export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Akram Perfumes",
  storeDescription:
    "Crafted fragrances for the modern connoisseur — attars, perfumes, incense and more, made in Madurai.",
  currency: "INR",
  timezone: "Asia/Kolkata",
  language: "English (India)",
  business: {
    name: BUSINESS.name,
    address: BUSINESS.addressLines.join("\n"),
    phone: BUSINESS.phone,
    email: BUSINESS.email,
  },
  gstNumber: "",
  shippingCharge: 0,
  freeShippingThreshold: 0,
  defaultTaxPercent: 0,
  codEnabled: false,
  social: {
    instagram: socialByLabel.get("instagram") ?? "https://instagram.com/akramperfumes",
    facebook: socialByLabel.get("facebook") ?? "https://facebook.com/akramperfumes",
    whatsapp: socialByLabel.get("whatsapp") ?? BUSINESS.whatsappHref,
    youtube: "",
  },
  seo: {
    metaTitle: "Akram Perfumes — Luxury Attars & Perfumes, Made in Madurai",
    metaDescription:
      "Discover Akram Perfumes — handcrafted attars, eaux de parfum, incense and solid perfumes. Secure checkout, fast delivery across India.",
    ogImage: "",
    robots: "index, follow",
    canonicalUrl: "https://akramperfumes.com",
  },
};
