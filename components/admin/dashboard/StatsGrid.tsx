"use client";

import { CheckCircle2, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";

import { StatCard } from "@/components/admin/dashboard/StatCard";
import { formatMoney } from "@/lib/money";
import type { DashboardStats } from "@/types/admin";

/**
 * Renders the five dashboard stat cards from server-fetched stats. Owns the
 * icon mapping so the Server Component only passes serializable data across the
 * boundary (functions like Lucide icons can't cross it).
 */
export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Total Products", value: String(stats.totalProducts), icon: Package },
    { label: "Active Products", value: String(stats.activeProducts), icon: CheckCircle2 },
    { label: "Orders", value: String(stats.totalOrders), icon: ShoppingCart },
    { label: "Customers", value: String(stats.totalCustomers), icon: Users },
    { label: "Revenue", value: formatMoney(stats.revenue), icon: IndianRupee },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          index={index}
        />
      ))}
    </div>
  );
}
