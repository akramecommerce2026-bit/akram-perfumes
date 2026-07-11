"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(1, "Please add a subject.").max(160),
  message: z.string().trim().min(10, "Please write a little more (10+ characters).").max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export interface ContactActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Handle a contact-form submission. No email provider is wired yet — the enquiry
 * is validated and logged server-side; swap the log for a provider (or a DB
 * insert) when ready. The client contract stays the same.
 */
export async function submitContactAction(values: ContactFormValues): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  console.info(`[contact] enquiry from ${parsed.data.email} — ${parsed.data.subject}`);
  return { ok: true };
}
