"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { useVariantSelection } from "@/components/product/variant-selection-context";
import { isRemoteImage } from "@/lib/is-remote-image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  /** Product-level gallery, shown for any variant without its own images. */
  sharedImages: readonly string[];
  /** variantId → that variant's own images (empty array when it has none). */
  variantImages: Readonly<Record<string, readonly string[]>>;
  name: string;
}

/**
 * Left-column gallery: large primary image with a CSS opacity cross-fade on
 * switch, cursor-following hover zoom, and vertical (desktop) / horizontal
 * (mobile) thumbnails. All images use next/image; the primary loads eagerly to
 * keep the LCP crisp, the rest lazily. Aspect ratio is fixed to avoid CLS.
 *
 * Variant-aware: it reads the selected variant from context and shows that
 * variant's own images when it has any, otherwise the shared product gallery.
 * Switching variants swaps the whole set instantly — no navigation — and resets
 * the active thumbnail so the customer always lands on the new set's first shot.
 * Zoom, thumbnails and the cross-fade are identical across every set.
 */
export function ProductGallery({ sharedImages, variantImages, name }: ProductGalleryProps) {
  const { selectedVariantId } = useVariantSelection();
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("center");

  const gallery = useMemo(() => {
    const own = variantImages[selectedVariantId] ?? [];
    const source = own.length > 0 ? own : sharedImages;
    return source.length > 0 ? source : ["/signature/bin-sheikh.webp"];
  }, [selectedVariantId, variantImages, sharedImages]);

  // Landing on the first shot of whichever set is now showing keeps the active
  // thumbnail from pointing past the end of a shorter variant gallery. Resetting
  // during render (React's "adjust state on prop change" pattern) rather than in
  // an effect avoids a second paint of the stale index.
  const galleryKey = gallery.join("|");
  const [lastKey, setLastKey] = useState(galleryKey);
  if (galleryKey !== lastKey) {
    setLastKey(galleryKey);
    setActive(0);
  }

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
              <Image src={image} alt="" fill unoptimized={isRemoteImage(image)} sizes="64px" className="object-cover" />
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
              unoptimized={isRemoteImage(image)}
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
