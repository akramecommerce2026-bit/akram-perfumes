"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import { productSchema, type ProductFormValues } from "@/lib/admin/product-schema";
import { uploadProductImage } from "@/lib/admin/product-images";
import { adminProductService } from "@/services/admin-product-service";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Revalidate admin + storefront surfaces affected by a catalogue change. */
function revalidateCatalogue() {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
}

export async function createProductAction(
  values: ProductFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }
  try {
    const id = await adminProductService.create(parsed.data);
    revalidateCatalogue();
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateProductAction(
  id: string,
  values: ProductFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product data." };
  }
  try {
    await adminProductService.update(id, parsed.data);
    revalidateCatalogue();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function deleteProductsAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (ids.length === 0) return { ok: false, error: "No products selected." };
  try {
    await adminProductService.softDelete(ids);
    revalidateCatalogue();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function setProductsActiveAction(
  ids: string[],
  active: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  if (ids.length === 0) return { ok: false, error: "No products selected." };
  try {
    await adminProductService.setActive(ids, active);
    revalidateCatalogue();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  try {
    const url = await uploadProductImage(file);
    return { ok: true, data: { url } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
