import { z } from "zod";

/**
 * Server-side validation for the admin Shipment Tracking form. Kept free of
 * `.default()` (values are always sent in full from the control) so the inferred
 * type stays a plain object.
 */
export const shipmentSchema = z.object({
  shipmentStatus: z.enum([
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ]),
  courierPartner: z.string().trim().max(120, "Courier name is too long."),
  trackingNumber: z.string().trim().max(120, "Tracking number is too long."),
  trackingUrl: z.union([z.literal(""), z.string().trim().url("Enter a valid tracking URL.")]),
  shippedAt: z.string().nullable(),
  estimatedDelivery: z.string().nullable(),
  shippingNotes: z.string().trim().max(1000, "Notes are too long."),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;
