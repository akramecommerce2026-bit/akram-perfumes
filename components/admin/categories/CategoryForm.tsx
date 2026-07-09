"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { SingleImageInput } from "@/components/admin/ui/SingleImageInput";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useToast } from "@/components/admin/ui/toast";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  uploadCategoryImageAction,
} from "@/lib/admin/category-actions";
import { categorySchema, slugify, type CategoryFormValues } from "@/lib/admin/category-schema";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  mode: "create" | "edit";
  defaultValues: CategoryFormValues;
  categoryId?: string;
}

export function CategoryForm({ mode, defaultValues, categoryId }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const nameField = register("name");
  const slugField = register("slug");
  const active = useWatch({ control, name: "active" });
  const imageUrl = useWatch({ control, name: "imageUrl" });

  async function onSubmit(values: CategoryFormValues) {
    const result =
      mode === "create"
        ? await createCategoryAction(values)
        : await updateCategoryAction(categoryId as string, values);

    if (result.ok) {
      toast({ title: mode === "create" ? "Category created" : "Category updated", variant: "success" });
      if (mode === "create") router.push("/admin/categories");
      else router.refresh();
    } else {
      toast({ title: "Could not save category", description: result.error, variant: "error" });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCategoryAction(categoryId as string);
    setDeleting(false);
    if (result.ok) {
      setDeleteOpen(false);
      toast({ title: "Category deleted", variant: "success" });
      router.push("/admin/categories");
    } else {
      setDeleteOpen(false);
      // Validation message, e.g. category still contains products.
      toast({ title: "Cannot delete category", description: result.error, variant: "error" });
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-3xl flex-col gap-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              aria-label="Back to categories"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {mode === "create" ? "New Category" : "Edit Category"}
            </h1>
          </div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </button>
          )}
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category Name" htmlFor="name" error={errors.name?.message}>
              <TextInput
                id="name"
                placeholder="Attars"
                {...nameField}
                onChange={(e) => {
                  nameField.onChange(e);
                  if (!slugEdited) setValue("slug", slugify(e.target.value), { shouldValidate: true });
                }}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Slug" htmlFor="slug" error={errors.slug?.message} hint="Used in storefront URLs.">
              <TextInput
                id="slug"
                placeholder="attars"
                {...slugField}
                onChange={(e) => {
                  setSlugEdited(true);
                  slugField.onChange(e);
                }}
                aria-invalid={!!errors.slug}
              />
            </Field>
          </div>
          <Field label="Description" htmlFor="description" error={errors.description?.message} optional>
            <Textarea id="description" rows={3} placeholder="Pure oil-based fragrances with lasting depth." {...register("description")} />
          </Field>
          <Field label="Category Image" optional hint="Shown wherever this collection is featured.">
            <SingleImageInput
              value={imageUrl ?? ""}
              onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
              uploadAction={uploadCategoryImageAction}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">SEO & Visibility</h2>
          <Field label="SEO Title" htmlFor="metaTitle" error={errors.metaTitle?.message} optional>
            <TextInput id="metaTitle" placeholder="Attars — Pure Oil Perfumes" {...register("metaTitle")} />
          </Field>
          <Field label="SEO Description" htmlFor="metaDescription" error={errors.metaDescription?.message} optional>
            <Textarea id="metaDescription" rows={2} placeholder="Discover our collection of pure oil-based attars…" {...register("metaDescription")} />
          </Field>
          <div className="rounded-xl border border-border bg-background p-4">
            <Toggle
              label={active ? "Active" : "Hidden"}
              description={active ? "Visible on the storefront." : "Hidden from the storefront."}
              checked={active}
              onChange={(checked) => setValue("active", checked, { shouldDirty: true })}
            />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:pl-64">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
            <Link
              href="/admin/categories"
              className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold disabled:pointer-events-none disabled:opacity-60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Saving…
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden="true" />
                  {mode === "create" ? "Create Category" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {mode === "edit" && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete this category?"
          description="It will be hidden from the storefront (soft delete). Categories that still contain products cannot be deleted."
          confirmLabel="Delete"
          destructive
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </FormProvider>
  );
}
