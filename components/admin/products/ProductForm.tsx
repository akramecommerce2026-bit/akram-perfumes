"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { ImageUploader } from "@/components/admin/products/ImageUploader";
import { NotesEditor } from "@/components/admin/products/NotesEditor";
import { SeoFields } from "@/components/admin/products/SeoFields";
import { VariantsEditor } from "@/components/admin/products/VariantsEditor";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field, Select, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useToast } from "@/components/admin/ui/toast";
import {
  createProductAction,
  deleteProductsAction,
  updateProductAction,
} from "@/lib/admin/product-actions";
import { productSchema, slugify, type ProductFormValues } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import {
  FRAGRANCE_FAMILIES,
  FRAGRANCE_FAMILY_LABELS,
  GENDER_LABELS,
  GENDERS,
} from "@/types/product-attributes";

interface ProductFormProps {
  mode: "create" | "edit";
  categories: readonly Category[];
  defaultValues: ProductFormValues;
  productId?: string;
}

export function ProductForm({ mode, categories, defaultValues, productId }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ProductFormValues>({
    // Cast needed because z.coerce.* makes the schema's input type diverge from
    // its output type; runtime coercion is correct.
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const nameField = register("name");
  const slugField = register("slug");
  const isFeatured = useWatch({ control: form.control, name: "isFeatured" });
  const active = useWatch({ control: form.control, name: "active" });

  async function onSubmit(values: ProductFormValues) {
    const result =
      mode === "create"
        ? await createProductAction(values)
        : await updateProductAction(productId as string, values);

    if (result.ok) {
      toast({
        title: mode === "create" ? "Product created" : "Product updated",
        variant: "success",
      });
      if (mode === "create") router.push("/admin/products");
      else router.refresh();
    } else {
      toast({ title: "Could not save product", description: result.error, variant: "error" });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteProductsAction([productId as string]);
    setDeleting(false);
    if (result.ok) {
      setDeleteOpen(false);
      toast({ title: "Product deleted", variant: "success" });
      router.push("/admin/products");
    } else {
      toast({ title: "Could not delete product", description: result.error, variant: "error" });
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pb-24">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              aria-label="Back to products"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {mode === "create" ? "New Product" : "Edit Product"}
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

        {/* Basic info */}
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Name" htmlFor="name" error={errors.name?.message}>
              <TextInput
                id="name"
                placeholder="Bin Sheikh"
                {...nameField}
                onChange={(e) => {
                  nameField.onChange(e);
                  if (!slugEdited) setValue("slug", slugify(e.target.value), { shouldValidate: true });
                }}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Slug" htmlFor="slug" error={errors.slug?.message} hint="Used in the product URL.">
              <TextInput
                id="slug"
                placeholder="bin-sheikh"
                {...slugField}
                onChange={(e) => {
                  setSlugEdited(true);
                  slugField.onChange(e);
                }}
                aria-invalid={!!errors.slug}
              />
            </Field>
          </div>
          <Field label="Short Description" htmlFor="shortDescription" error={errors.shortDescription?.message} optional>
            <TextInput id="shortDescription" placeholder="A one-line summary shown on cards." {...register("shortDescription")} />
          </Field>
          <Field label="Full Description" htmlFor="description" error={errors.description?.message} optional>
            <Textarea id="description" rows={5} placeholder="The full product story…" {...register("description")} />
          </Field>
        </section>

        {/* Organization */}
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Organization</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
              <Select id="categoryId" {...register("categoryId")} aria-invalid={!!errors.categoryId}>
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Brand" htmlFor="brand" error={errors.brand?.message}>
              <TextInput id="brand" placeholder="Akram Perfumes" {...register("brand")} aria-invalid={!!errors.brand} />
            </Field>
            <Field label="Gender" htmlFor="gender" error={errors.gender?.message}>
              <Select id="gender" {...register("gender")}>
                {GENDERS.map((value) => (
                  <option key={value} value={value}>
                    {GENDER_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Fragrance Family" htmlFor="fragranceFamily" error={errors.fragranceFamily?.message}>
              <Select id="fragranceFamily" {...register("fragranceFamily")}>
                {FRAGRANCE_FAMILIES.map((value) => (
                  <option key={value} value={value}>
                    {FRAGRANCE_FAMILY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Concentration" htmlFor="concentration" error={errors.concentration?.message} optional>
              <TextInput id="concentration" placeholder="Extrait de Parfum" {...register("concentration")} />
            </Field>
          </div>
          <div className="grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
            <Toggle
              label="Featured Product"
              description="Highlight this product on the storefront."
              checked={isFeatured}
              onChange={(checked) => setValue("isFeatured", checked, { shouldDirty: true })}
            />
            <Toggle
              label={active ? "Active" : "Draft"}
              description={active ? "Visible on the storefront." : "Hidden from the storefront."}
              checked={active}
              onChange={(checked) => setValue("active", checked, { shouldDirty: true })}
            />
          </div>
        </section>

        <VariantsEditor />
        <NotesEditor />
        <ImageUploader />
        <SeoFields />

        {/* Sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:pl-64">
          <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
            <Link
              href="/admin/products"
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
                  {mode === "create" ? "Create Product" : "Save Changes"}
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
          title="Delete this product?"
          description="It will be removed from your storefront. This is a soft delete and can be restored from the database if needed."
          confirmLabel="Delete"
          destructive
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </FormProvider>
  );
}
