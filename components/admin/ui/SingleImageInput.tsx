"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { isRemoteImage } from "@/lib/is-remote-image";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useToast } from "@/components/admin/ui/toast";
import type { ActionResult } from "@/lib/admin/product-actions";

interface SingleImageInputProps {
  value: string;
  onChange: (url: string) => void;
  uploadAction: (formData: FormData) => Promise<ActionResult<{ url: string }>>;
}

/** Reusable single-image upload with preview + remove. Backed by a server action. */
export function SingleImageInput({ value, onChange, uploadAction }: SingleImageInputProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadAction(formData);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (result.ok) onChange(result.data.url);
    else toast({ title: "Upload failed", description: result.error, variant: "error" });
  }

  return (
    <>
      {value ? (
        <div className="relative w-fit overflow-hidden rounded-xl border border-border">
          <div className="relative h-40 w-64">
            <Image src={value} alt="Category image" fill unoptimized={isRemoteImage(value)} sizes="256px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-foreground/60 text-white transition-colors hover:bg-destructive"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-center transition-colors hover:border-accent/60"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="text-sm font-medium text-foreground">
            {uploading ? "Uploading…" : "Upload image"}
          </span>
          <span className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF · up to 5 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => void handleUpload(e.target.files?.[0])}
      />
    </>
  );
}
