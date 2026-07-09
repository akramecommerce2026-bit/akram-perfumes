"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";

import { useToast } from "@/components/admin/ui/toast";
import { uploadProductImageAction } from "@/lib/admin/product-actions";
import type { ProductFormValues } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";

export function ImageUploader() {
  const { control, getValues, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "images" });
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadProductImageAction(formData);
        if (result.ok) {
          const hasPrimary = getValues("images").some((img) => img.isPrimary);
          append({
            url: result.data.url,
            alt: "",
            isPrimary: !hasPrimary,
            displayOrder: getValues("images").length,
          });
        } else {
          toast({ title: "Upload failed", description: result.error, variant: "error" });
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(event.dataTransfer.files);
  }

  function makePrimary(index: number) {
    const images = getValues("images");
    setValue(
      "images",
      images.map((img, i) => ({ ...img, isPrimary: i === index })),
      { shouldDirty: true },
    );
  }

  function handleRemove(index: number) {
    const wasPrimary = getValues(`images.${index}.isPrimary`);
    remove(index);
    if (wasPrimary) {
      const remaining = getValues("images");
      if (remaining.length > 0) {
        setValue("images.0.isPrimary", true, { shouldDirty: true });
      }
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header>
        <h2 className="font-heading text-lg font-semibold text-foreground">Product Images</h2>
        <p className="text-xs text-muted-foreground">
          Drag & drop or browse. The primary image is used across the storefront.
        </p>
      </header>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-accent bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]" : "border-border hover:border-accent/60",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-sm font-medium text-foreground">
          {uploading ? "Uploading…" : "Drop images here or click to browse"}
        </span>
        <span className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF · up to 5 MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {fields.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fields.map((field, index) => {
            const image = getValues(`images.${index}`);
            return (
              <li
                key={field.id}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-muted",
                  image.isPrimary ? "border-accent ring-2 ring-accent/40" : "border-border",
                )}
              >
                <div className="relative aspect-square">
                  <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
                {image.isPrimary && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    <Star className="size-3 fill-current" aria-hidden="true" /> Primary
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-foreground/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Move left" className="flex size-7 items-center justify-center rounded-md text-white transition-colors hover:bg-white/20 disabled:opacity-30">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => makePrimary(index)} disabled={image.isPrimary} aria-label="Mark as primary" className="flex size-7 items-center justify-center rounded-md text-white transition-colors hover:bg-white/20 disabled:opacity-30">
                    <Star className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => handleRemove(index)} aria-label="Delete image" className="flex size-7 items-center justify-center rounded-md text-white transition-colors hover:bg-destructive">
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} aria-label="Move right" className="flex size-7 items-center justify-center rounded-md text-white transition-colors hover:bg-white/20 disabled:opacity-30">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
