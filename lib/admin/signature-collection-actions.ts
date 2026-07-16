"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import { uploadImageToBucket } from "@/lib/admin/product-images";
import {
  signatureCollectionSchema,
  type SignatureCollectionFormValues,
} from "@/lib/admin/signature-collection-schema";
import { adminSignatureCollectionService } from "@/services/admin-signature-collection-service";
import type { ActionResult } from "@/lib/admin/product-actions";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** The Signature section is rendered on the homepage, which is statically cached. */
function revalidateSignature() {
  revalidatePath("/admin/signature");
  revalidatePath("/");
}

export async function createSignatureCollectionAction(
  values: SignatureCollectionFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = signatureCollectionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid section data." };
  }
  try {
    const id = await adminSignatureCollectionService.create(parsed.data);
    revalidateSignature();
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateSignatureCollectionAction(
  id: string,
  values: SignatureCollectionFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "No section specified." };
  const parsed = signatureCollectionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid section data." };
  }
  try {
    await adminSignatureCollectionService.update(id, parsed.data);
    revalidateSignature();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function deleteSignatureCollectionAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "No section specified." };
  try {
    await adminSignatureCollectionService.delete(id);
    revalidateSignature();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function uploadSignatureImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  try {
    const url = await uploadImageToBucket(file, "signature");
    return { ok: true, data: { url } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
