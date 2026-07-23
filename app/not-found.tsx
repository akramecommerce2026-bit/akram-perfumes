import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/common/container";

export const metadata: Metadata = {
  title: "Page Not Found — Akram Perfumes",
  robots: { index: false },
};

/**
 * 404.
 *
 * Lives at the app root rather than inside (storefront) because Next serves this
 * for any unmatched URL, including ones outside the storefront's route group —
 * so it cannot rely on that layout's chrome or theme. It carries
 * `storefront-theme` itself and links back into the catalogue, so a mistyped URL
 * lands somewhere branded instead of on the framework's default page.
 */
export default function NotFound() {
  return (
    <div className="storefront-theme flex min-h-screen items-center py-16">
      <Container>
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
            Error 404
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            This page has drifted away
          </h1>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. The collection is
            still here.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-8 text-[13px] font-bold tracking-wide text-background uppercase transition-opacity duration-300 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Shop All Fragrances
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-foreground/85 px-8 text-[13px] font-bold tracking-wide text-foreground uppercase transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Back Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
