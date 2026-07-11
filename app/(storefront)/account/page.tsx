import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, MapPin, Package, ShoppingBag, User, Wallet } from "lucide-react";

import { AccountWishlistCard } from "@/components/account/AccountWishlistCard";
import { Container } from "@/components/common/container";
import { ShipmentStatusBadge } from "@/components/shipment/ShipmentStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOutCustomerAction } from "@/lib/auth/actions";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountService } from "@/services/account-service";

export const metadata: Metadata = {
  title: "My Account — Akram Perfumes",
  robots: { index: false },
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const name = (user.user_metadata?.full_name as string | undefined)?.trim() || email.split("@")[0];
  const account = await accountService.getAccountData(email);

  return (
    <div className="py-section-sm lg:py-section">
      <Container>
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-accent uppercase">My Account</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Hello, {name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{email}</p>
          </div>
          <form action={signOutCustomerAction}>
            <Button type="submit" variant="outline" className="rounded-full">
              <LogOut className="size-4" aria-hidden="true" /> Log out
            </Button>
          </form>
        </header>

        {/* Overview stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="size-4 text-accent" aria-hidden="true" /> Orders
            </span>
            <span className="font-heading text-2xl font-semibold text-foreground">{account.orderCount}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="size-4 text-accent" aria-hidden="true" /> Total spent
            </span>
            <span className="font-heading text-2xl font-semibold text-foreground">
              {formatMoney(account.totalSpent)}
            </span>
          </div>
          <AccountWishlistCard />
          <Link
            href="/track"
            className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-accent/60"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="size-4 text-accent" aria-hidden="true" /> Tracking
            </span>
            <span className="font-heading text-lg font-semibold text-foreground">Track an order</span>
            <span className="text-xs text-accent">Enter order number →</span>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          {/* Orders */}
          <section className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
            <header className="flex items-center gap-2 border-b border-border px-6 py-4">
              <ShoppingBag className="size-4 text-accent" aria-hidden="true" />
              <h2 className="font-heading text-lg font-semibold text-foreground">Order History</h2>
            </header>
            {account.orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">You haven&rsquo;t placed any orders yet.</p>
                <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {account.orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">{order.orderNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"} ·{" "}
                        {formatMoney(order.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShipmentStatusBadge status={order.shipmentStatus} />
                      <Link
                        href={`/track/${encodeURIComponent(order.orderNumber)}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        Track
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Profile + Addresses */}
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <User className="size-4 text-accent" aria-hidden="true" /> Profile
              </h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium text-foreground">{name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="truncate font-medium text-foreground">{email}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Member since</dt>
                  <dd className="font-medium text-foreground">{formatDate(user.created_at)}</dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                <MapPin className="size-4 text-accent" aria-hidden="true" /> Saved Addresses
              </h2>
              {account.addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No saved addresses yet. Addresses from your orders will appear here.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {account.addresses.map((address, index) => {
                    const lines = [
                      address.line1,
                      address.line2,
                      address.landmark,
                      `${address.city}, ${address.state} ${address.pincode}`,
                      address.country,
                    ].filter(Boolean);
                    return (
                      <li key={index} className="rounded-xl border border-border/60 bg-background p-3 text-sm text-muted-foreground">
                        {lines.map((line, i) => (
                          <span key={i} className="block">{line}</span>
                        ))}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
