"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Analytics failed to load:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold text-foreground">Couldn&rsquo;t load analytics</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          There was a problem fetching your store data. Please try again.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <RefreshCw className="size-4" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}
