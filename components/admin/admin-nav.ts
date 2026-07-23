import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
}

/**
 * Admin sidebar navigation. Single source of truth so the sidebar and any
 * future breadcrumb/command-palette stay in sync.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
