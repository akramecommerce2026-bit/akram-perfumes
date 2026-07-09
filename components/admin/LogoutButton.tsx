"use client";

import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";

import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Signs the admin out via a Server Action (reliable cookie clearing) and lands
 * on the login page. Shared by the sidebar labelled and icon-only (`collapsed`)
 * layouts.
 */
export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => signOutAction())}
      disabled={pending}
      title="Logout"
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors",
        "hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        collapsed ? "w-11 justify-center" : "w-full",
      )}
    >
      {pending ? (
        <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-5 shrink-0" aria-hidden="true" />
      )}
      {!collapsed && <span>Logout</span>}
    </button>
  );
}
