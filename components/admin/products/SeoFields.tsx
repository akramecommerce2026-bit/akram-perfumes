"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/is-remote-image";
import { useFormContext } from "react-hook-form";
import { ImagePlus, Loader2, X } from "lucide-react";

import { ChipsInput } from "@/components/admin/products/ChipsInput";
import { Field, TextInput, Textarea } from "@/components/admin/ui/form-fields";
import { useToast } from "@/components/admin/ui/toast";
import { uploadProductImageAction } from "@/lib/admin/product-actions";
import type { ProductFormValues } from "@/lib/admin/product-schema";

export function SeoFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const ogImage = watch("ogImage");

  async function handleOgUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImageAction(formData);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (result.ok) setValue("ogImage", result.data.url, { shouldDirty: true });
    else toast({ title: "Upload failed", description: result.error, variant: "error" });
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header>
        <h2 className="font-heading text-lg font-semibold text-foreground">SEO</h2>
        <p className="text-xs text-muted-foreground">
          Control how this product appears in search and social previews.
        </p>
      </header>

      <div className="grid gap-4">
        <Field label="Meta Title" htmlFor="metaTitle" error={errors.metaTitle?.message} optional hint="Recommended: up to 60 characters.">
          <TextInput id="metaTitle" placeholder="Bin Sheikh — Luxury Oud Perfume" {...register("metaTitle")} />
        </Field>
        <Field label="Meta Description" htmlFor="metaDescription" error={errors.metaDescription?.message} optional hint="Recommended: up to 160 characters.">
          <Textarea id="metaDescription" rows={3} placeholder="A rich oriental oud wrapped in warm spice and soft amber…" {...register("metaDescription")} />
        </Field>
        <Field label="Keywords" htmlFor="keywords" optional>
          <ChipsInput
            id="keywords"
            value={watch("keywords")}
            onChange={(next) => setValue("keywords", next, { shouldDirty: true })}
            placeholder="oud, attar, luxury perfume"
          />
        </Field>
        <Field label="OpenGraph Image" optional hint="Falls back to the primary product image when empty.">
          {ogImage ? (
            <div className="relative w-fit overflow-hidden rounded-xl border border-border">
              <div className="relative h-32 w-56">
                <Image src={ogImage} alt="OpenGraph preview" fill unoptimized={isRemoteImage(ogImage)} sizes="224px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setValue("ogImage", "", { shouldDirty: true })}
                aria-label="Remove OpenGraph image"
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-foreground/60 text-white transition-colors hover:bg-destructive"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-32 w-56 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-center transition-colors hover:border-accent/60"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Upload image"}</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            hidden
            onChange={(e) => void handleOgUpload(e.target.files?.[0])}
          />
        </Field>
      </div>
    </section>
  );
}
