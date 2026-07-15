"use client";

import {
  Ban,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Coins,
  PackageCheck,
  Percent,
  Receipt,
  Repeat,
  Settings2 as Cog,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { formatMoney } from "@/lib/money";
import type { OverviewStats } from "@/types/admin-analytics";

interface Tile {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function KpiOverview({ stats }: { stats: OverviewStats }) {
  const tiles: Tile[] = [
    { label: "Total Revenue", value: formatMoney(stats.totalRevenue), icon: CircleDollarSign, hint: "Paid orders, all-time" },
    { label: "Today's Revenue", value: formatMoney(stats.todayRevenue), icon: Coins },
    { label: "Monthly Revenue", value: formatMoney(stats.monthRevenue), icon: CalendarDays, hint: "This calendar month" },
    { label: "Orders Today", value: String(stats.ordersToday), icon: ShoppingCart },
    { label: "Orders This Month", value: String(stats.ordersThisMonth), icon: ShoppingBag },
    { label: "Total Orders", value: String(stats.totalOrders), icon: Receipt },
    { label: "Avg. Order Value", value: formatMoney(stats.averageOrderValue), icon: Wallet, hint: "Per paid order" },
    { label: "Returning Customers", value: String(stats.returningCustomers), icon: Repeat, hint: "2+ orders" },
    { label: "New Customers", value: String(stats.newCustomers), icon: UserPlus, hint: "This month" },
    {
      label: "Conversion Rate",
      value: stats.conversionRate === null ? "—" : `${(stats.conversionRate * 100).toFixed(1)}%`,
      icon: Percent,
      hint: "Needs storefront traffic",
    },
    { label: "Pending Orders", value: String(stats.pendingOrders), icon: Clock },
    { label: "Processing Orders", value: String(stats.processingOrders), icon: Cog, hint: "Confirmed + packed" },
    { label: "Shipped Orders", value: String(stats.shippedOrders), icon: Truck, hint: "Incl. out for delivery" },
    { label: "Delivered Orders", value: String(stats.deliveredOrders), icon: PackageCheck },
    { label: "Cancelled Orders", value: String(stats.cancelledOrders), icon: Ban, hint: "Incl. returned" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {tiles.map((tile, index) => (
        <StatCard
          key={tile.label}
          label={tile.label}
          value={tile.value}
          icon={tile.icon}
          hint={tile.hint}
          index={index}
        />
      ))}
    </div>
  );
}
