import { z } from "zod";

import { PAYMENT_OPTIONS, type OfferedPaymentMethodId } from "@/lib/checkout";

const paymentIds = PAYMENT_OPTIONS.map((option) => option.id) as [
  OfferedPaymentMethodId,
  ...OfferedPaymentMethodId[],
];

/**
 * Single source of truth for checkout form validation. The inferred type drives
 * React Hook Form, and the same schema can validate a server action / Supabase
 * insert later, so client and server never drift.
 */
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(4, "Please enter your address").max(120, "Address is too long"),
  line2: z.string().trim().max(120, "Address is too long").optional().or(z.literal("")),
  landmark: z.string().trim().max(80, "Landmark is too long").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter your city"),
  state: z.string().trim().min(2, "Please select your state"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().trim().min(2, "Please enter your country"),
  paymentMethod: z.enum(paymentIds),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const INDIAN_STATES: readonly string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
