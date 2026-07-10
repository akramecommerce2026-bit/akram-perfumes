import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Initials avatar for a customer. Sizes map to the list (sm) and detail (lg). */
export function CustomerAvatar({
  name,
  size = "sm",
  className,
}: {
  name: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground",
        size === "sm" ? "size-9 text-xs" : "size-14 text-lg",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
