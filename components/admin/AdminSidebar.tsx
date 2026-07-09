"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  /** Icon-only rail (tablet collapse). */
  collapsed?: boolean;
  /** Called after navigating — used to close the mobile drawer. */
  onNavigate?: () => void;
}

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-card">
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-6",
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex flex-col leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {collapsed ? (
            <span className="font-heading text-lg font-semibold text-foreground">A</span>
          ) : (
            <>
              <span className="font-heading text-lg font-semibold tracking-[0.2em] text-foreground">
                AKRAM
              </span>
              <span className="text-[10px] font-medium tracking-[0.25em] text-accent uppercase">
                Admin
              </span>
            </>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-5 shrink-0", active && "text-accent")}
                    aria-hidden="true"
                  />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
}
