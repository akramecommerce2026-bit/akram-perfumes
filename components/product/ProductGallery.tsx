"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: readonly string[];
  name: string;
}

/**
 * Left-column gallery: large primary image with a CSS opacity cross-fade on
 * switch, cursor-following hover zoom, and vertical (desktop) / horizontal
 * (mobile) thumbnails. All images use next/image; the primary loads eagerly to
 * keep the LCP crisp, the rest lazily. Aspect ratio is fixed to avoid CLS.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("center");

  const gallery = images.length > 0 ? images : ["/signature/bin-sheikh.webp"];

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {gallery.length > 1 && (
        <div className="flex gap-3 lg:flex-col" role="tablist" aria-label="Product images">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`View image ${index + 1}`}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === active ? "border-accent" : "border-transparent hover:border-border",
              )}
            >
              <Image src={image} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative aspect-square flex-1 overflow-hidden rounded-lg border border-border/60 bg-muted"
        onMouseMove={handleMove}
        onMouseLeave={() => setOrigin("center")}
      >
        {gallery.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={image}
              alt={`${name} — image ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 45vw, 100vw"
              style={{ transformOrigin: origin }}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-150 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
