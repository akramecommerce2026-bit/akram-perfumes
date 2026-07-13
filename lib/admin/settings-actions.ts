"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/admin-session";
import type { ActionResult } from "@/lib/admin/product-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { settingsService } from "@/services/admin-settings-service";
import type { StoreSettings } from "@/types/admin-settings";

const settingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required.").max(120),
  storeDescription: z.string().trim().max(600),
  currency: z.string().trim().min(1),
  timezone: z.string().trim().min(1),
  language: z.string().trim().min(1),
  business: z.object({
    name: z.string().trim().max(120),
    address: z.string().trim().max(400),
    phone: z.string().trim().max(40),
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid business email.")]),
  }),
  gstNumber: z.string().trim().max(20),
  shippingCharge: z.coerce.number().min(0).max(100000),
  freeShippingThreshold: z.coerce.number().min(0).max(1000000),
  defaultTaxPercent: z.coerce.number().min(0).max(100),
  codEnabled: z.boolean(),
  social: z.object({
    instagram: z.string().trim().max(200),
    facebook: z.string().trim().max(200),
    whatsapp: z.string().trim().max(200),
    youtube: z.string().trim().max(200),
  }),
  seo: z.object({
    metaTitle: z.string().trim().max(160),
    metaDescription: z.string().trim().max(320),
    ogImage: z.string().trim().max(400),
    robots: z.string().trim().max(80),
    canonicalUrl: z.string().trim().max(200),
  }),
});

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export async function updateSettingsAction(values: StoreSettings): Promise<ActionResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings." };
  }
  try {
    await settingsService.saveStoreSettings(parsed.data as StoreSettings);
    revalidatePath("/admin/settings");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function changePasswordAction(newPassword: string): Promise<ActionResult> {
  await requireAdmin();
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
