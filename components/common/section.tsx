import type { ReactNode } from "react";

import { Container } from "@/components/common/container";
import { cn } from "@/lib/utils";

type SectionSpacing = "sm" | "md" | "lg";
type SectionBackground = "none" | "muted" | "card";

const spacingClasses: Record<SectionSpacing, string> = {
  sm: "py-section-sm",
  md: "py-section",
  lg: "py-section-lg",
};

const backgroundClasses: Record<SectionBackground, string> = {
  none: "",
  muted: "bg-muted",
  card: "bg-card",
};

interface SectionProps {
  id?: string;
  spacing?: SectionSpacing;
  background?: SectionBackground;
  container?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  spacing = "md",
  background = "none",
  container = true,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(spacingClasses[spacing], backgroundClasses[background], className)}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}
