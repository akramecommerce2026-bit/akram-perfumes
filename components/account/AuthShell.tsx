import type { ReactNode } from "react";

import { Container } from "@/components/common/container";

/** Centered card wrapper shared by the login / register / forgot-password pages. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="font-heading text-2xl font-semibold tracking-[0.2em] text-foreground">AKRAM</span>
            <span className="text-xs font-medium tracking-[0.25em] text-accent uppercase">Perfumes</span>
          </div>
          <div className="mb-6 flex flex-col gap-1 text-center">
            <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
