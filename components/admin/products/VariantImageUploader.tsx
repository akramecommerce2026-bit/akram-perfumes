"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/is-remote-image";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";

import { useToast } from "@/components/admin/ui/toast";
import { uploadProductImageAction } from "@/lib/admin/product-actions";
import type { ProductFormValues } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";

/**
 * Per-variant gallery editor. Bound to `variants.<index>.images`, so each
 * variant manages its own images independently. Deliberately simpler than the
 * product-level ImageUploader: no "primary" concept — a variant's images are
 * just an ordered set shown when that variant is selected on the storefront.
 * When a variant has none, the storefront falls back to the product gallery.
 */
export function VariantImageUploader({ variantIndex }: { variantIndex: number }) {
  const { control, getValues } = useFormContext<ProductFormValues>();
  const name = `variants.${variantIndex}.images` as const;
  const { fields, append, remove, move } = useFieldArray({ control, name });
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
          append({
            url: result.data.url,
            alt: "",
            isPrimary: false,
            displayOrder: getValues(name)?.length ?? 0,
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

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">
          Variant images
          <span className="ml-1.5 font-normal text-muted-foreground">
            — shown only when this option is selected. Optional.
          </span>
        </span>
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
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
            dragOver
              ? "border-accent bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] text-accent"
              : "border-border bg-background text-foreground hover:border-accent hover:text-accent",
          )}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-3.5" aria-hidden="true" />
          )}
          {uploading ? "Uploading…" : "Upload images"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {fields.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {fields.map((field, index) => {
            const image = getValues(`${name}.${index}`);
            return (
              <li
                key={field.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-muted"
              >
                <div className="relative aspect-square">
                  <Image src={image.url} alt="" fill unoptimized={isRemoteImage(image.url)} sizes="120px" className="object-cover" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-foreground/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move left"
                    className="flex size-6 items-center justify-center rounded text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Delete image"
                    className="flex size-6 items-center justify-center rounded text-white transition-colors hover:bg-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    aria-label="Move right"
                    className="flex size-6 items-center justify-center rounded text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
