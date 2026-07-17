"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignatureFeatures } from "@/components/home/SignatureFeatures";
import type { SignatureCollection } from "@/types/signature-collection";

interface SignatureContentProps {
  collection: SignatureCollection;
}

export function SignatureContent({ collection }: SignatureContentProps) {
  const hasButton = Boolean(collection.buttonText && collection.buttonUrl);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-start gap-6">
        {collection.subtitle && (
          <span
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-safe:fill-mode-both inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-foreground uppercase"
          >
            <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
            {collection.subtitle}
          </span>
        )}

        <h2
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-both text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          {collection.title}
        </h2>

        {collection.description && (
          <p className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-safe:fill-mode-both motion-safe:delay-100 max-w-md text-base text-muted-foreground sm:text-lg">
            {collection.description}
          </p>
        )}
      </div>

      <SignatureFeatures />

      {hasButton && (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-safe:fill-mode-both flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={collection.buttonUrl}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full px-8 text-sm tracking-wide transition-shadow duration-300",
            )}
          >
            {collection.buttonText}
          </Link>
        </div>
      )}
    </div>
  );
}
