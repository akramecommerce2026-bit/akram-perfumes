"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin-session";
import { categorySchema, type CategoryFormValues } from "@/lib/admin/category-schema";
import { uploadImageToBucket } from "@/lib/admin/product-images";
import { adminCategoryService } from "@/services/admin-category-service";
import type { ActionResult } from "@/lib/admin/product-actions";

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Category changes affect storefront filters + product category labels. */
function revalidateCatalogue() {
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/shop/[slug]", "page");
}

export async function createCategoryAction(
  values: CategoryFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category data." };
  }
  try {
    const id = await adminCategoryService.create(parsed.data);
    revalidateCatalogue();
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function updateCategoryAction(
  id: string,
  values: CategoryFormValues,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category data." };
  }
  try {
    await adminCategoryService.update(id, parsed.data);
    revalidateCatalogue();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "No category specified." };
  try {
    await adminCategoryService.delete(id);
    revalidateCatalogue();
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

export async function uploadCategoryImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file provided." };
  }
  try {
    const url = await uploadImageToBucket(file, "categories");
    return { ok: true, data: { url } };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
