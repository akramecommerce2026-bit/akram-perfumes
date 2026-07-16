"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Field, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { SingleImageInput } from "@/components/admin/ui/SingleImageInput";
import { Toggle } from "@/components/admin/ui/Toggle";
import { useToast } from "@/components/admin/ui/toast";
import {
  createSignatureCollectionAction,
  deleteSignatureCollectionAction,
  updateSignatureCollectionAction,
  uploadSignatureImageAction,
} from "@/lib/admin/signature-collection-actions";
import {
  signatureCollectionSchema,
  type SignatureCollectionFormValues,
} from "@/lib/admin/signature-collection-schema";
import { cn } from "@/lib/utils";

interface SignatureCollectionFormProps {
  mode: "create" | "edit";
  defaultValues: SignatureCollectionFormValues;
  collectionId?: string;
}

export function SignatureCollectionForm({
  mode,
  defaultValues,
  collectionId,
}: SignatureCollectionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<SignatureCollectionFormValues>({
    // Cast needed because z.coerce.* makes the schema's input type diverge from
    // its output type; runtime coercion is correct.
    resolver: zodResolver(signatureCollectionSchema) as Resolver<SignatureCollectionFormValues>,
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

  const active = useWatch({ control, name: "active" });
  const backgroundImage = useWatch({ control, name: "backgroundImage" });
  const collectionImage = useWatch({ control, name: "collectionImage" });

  async function onSubmit(values: SignatureCollectionFormValues) {
    const result =
      mode === "create"
        ? await createSignatureCollectionAction(values)
        : await updateSignatureCollectionAction(collectionId as string, values);

    if (result.ok) {
      toast({ title: mode === "create" ? "Section created" : "Section updated", variant: "success" });
      if (mode === "create") router.push("/admin/signature");
      else router.refresh();
    } else {
      toast({ title: "Could not save section", description: result.error, variant: "error" });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteSignatureCollectionAction(collectionId as string);
    setDeleting(false);
    setDeleteOpen(false);
    if (result.ok) {
      toast({ title: "Section deleted", variant: "success" });
      router.push("/admin/signature");
    } else {
      toast({ title: "Cannot delete section", description: result.error, variant: "error" });
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-3xl flex-col gap-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/signature"
              aria-label="Back to signature collections"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {mode === "create" ? "New Signature Section" : "Edit Signature Section"}
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
          <h2 className="font-heading text-lg font-semibold text-foreground">Content</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" error={errors.title?.message} hint="The large heading.">
              <TextInput id="title" placeholder="Bin Sheikh" {...register("title")} aria-invalid={!!errors.title} />
            </Field>
            <Field
              label="Subtitle"
              htmlFor="subtitle"
              error={errors.subtitle?.message}
              optional
              hint="The small badge above the title."
            >
              <TextInput id="subtitle" placeholder="Signature Collection" {...register("subtitle")} />
            </Field>
          </div>
          <Field label="Description" htmlFor="description" error={errors.description?.message} optional>
            <Textarea
              id="description"
              rows={3}
              placeholder="A masterpiece crafted with rich oriental notes, refined elegance, and exceptional longevity."
              {...register("description")}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Images</h2>
          <Field label="Collection Image" optional hint="The bottle shown beside the copy.">
            <SingleImageInput
              value={collectionImage ?? ""}
              onChange={(url) => setValue("collectionImage", url, { shouldDirty: true })}
              uploadAction={uploadSignatureImageAction}
            />
          </Field>
          <Field
            label="Background Image"
            optional
            hint="Optional backdrop. The gold gradient shows through when empty."
          >
            <SingleImageInput
              value={backgroundImage ?? ""}
              onChange={(url) => setValue("backgroundImage", url, { shouldDirty: true })}
              uploadAction={uploadSignatureImageAction}
            />
          </Field>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Call to Action</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button Text" htmlFor="buttonText" error={errors.buttonText?.message} optional>
              <TextInput id="buttonText" placeholder="Shop Bin Sheikh" {...register("buttonText")} />
            </Field>
            <Field
              label="Button URL"
              htmlFor="buttonUrl"
              error={errors.buttonUrl?.message}
              optional
              hint="e.g. /shop?collection=bin-sheikh"
            >
              <TextInput id="buttonUrl" placeholder="/shop?collection=bin-sheikh" {...register("buttonUrl")} />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave both empty to hide the button. Filling one without the other is rejected, so the
            storefront never shows a button that goes nowhere.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-semibold text-foreground">Placement & Visibility</h2>
          <Field
            label="Display Order"
            htmlFor="displayOrder"
            error={errors.displayOrder?.message}
            hint="Lower numbers appear first on the homepage."
          >
            <TextInput
              id="displayOrder"
              type="number"
              min={0}
              step={1}
              {...register("displayOrder")}
              aria-invalid={!!errors.displayOrder}
            />
          </Field>
          <div className="rounded-xl border border-border bg-background p-4">
            <Toggle
              label={active ? "Active" : "Hidden"}
              description={active ? "Visible on the homepage." : "Hidden from the homepage."}
              checked={active}
              onChange={(checked) => setValue("active", checked, { shouldDirty: true })}
            />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:pl-64">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
            <Link
              href="/admin/signature"
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
                  {mode === "create" ? "Create Section" : "Save Changes"}
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
          title="Delete this section?"
          description="It will be removed from the homepage (soft delete) and can be restored from the database if needed."
          confirmLabel="Delete"
          destructive
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </FormProvider>
  );
}
