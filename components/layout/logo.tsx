import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Akram Perfumes home"
      className={cn(
        "font-heading text-xl font-semibold tracking-[0.2em] text-foreground transition-opacity hover:opacity-80 sm:text-2xl",
        className,
      )}
    >
      AKRAM
    </Link>
  );
}
