/**
 * Seeds realistic demo customers (with saved addresses + linked orders) so the
 * Admin → Customers module has data to work against on the live database.
 *
 * Fully idempotent: each seed customer has a fixed uuid, and its orders,
 * addresses and record are cleared and re-created on every run. It never touches
 * real (non-seed) customers or orders.
 *
 * Requires the service-role key (bypasses RLS). Run:
 *   npx tsx --env-file=.env.local scripts/seed-customers.ts
 *
 * NOTE: apply migration 0005 (customers.active + deleted_at) first — via the
 * Supabase SQL editor / apply_all.sql — or the inserts below will fail.
 */
import { createClient } from "@supabase/supabase-js";

import type { Database, TablesInsert } from "../lib/supabase/database.types";
import { getServiceRoleKey, isSupabaseConfigured, supabaseUrl } from "../lib/supabase/env";

if (!isSupabaseConfigured()) {
  throw new Error(
    "Missing Supabase env. Run with: npx tsx --env-file=.env.local scripts/seed-customers.ts",
  );
}

const db = createClient<Database>(supabaseUrl, getServiceRoleKey(), {
  auth: { persistSession: false },
});

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

interface SeedOrder {
  daysAgo: number;
  status: Database["public"]["Enums"]["order_status"];
  paymentStatus: Database["public"]["Enums"]["payment_status"];
  itemCount: number;
}

interface SeedCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  deleted: boolean;
  joinedDaysAgo: number;
  address: { line1: string; city: string; state: string; pincode: string };
  orders: SeedOrder[];
}

const SEED: SeedCustomer[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    fullName: "Aisha Khan",
    email: "aisha.khan@example.com",
    phone: "+91 98200 11111",
    active: true,
    deleted: false,
    joinedDaysAgo: 120,
    address: { line1: "12 Rose Villa, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
    orders: [
      { daysAgo: 90, status: "delivered", paymentStatus: "paid", itemCount: 2 },
      { daysAgo: 40, status: "delivered", paymentStatus: "paid", itemCount: 1 },
      { daysAgo: 5, status: "pending", paymentStatus: "pending", itemCount: 1 },
    ],
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    fullName: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 99100 22222",
    active: true,
    deleted: false,
    joinedDaysAgo: 60,
    address: { line1: "45 Green Park", city: "New Delhi", state: "Delhi", pincode: "110016" },
    orders: [{ daysAgo: 20, status: "shipped", paymentStatus: "paid", itemCount: 1 }],
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    fullName: "Fatima Begum",
    email: "fatima.begum@example.com",
    phone: "+91 90040 33333",
    active: true,
    deleted: false,
    joinedDaysAgo: 200,
    address: { line1: "7 Charminar Road", city: "Hyderabad", state: "Telangana", pincode: "500002" },
    orders: [
      { daysAgo: 150, status: "delivered", paymentStatus: "paid", itemCount: 2 },
      { daysAgo: 12, status: "confirmed", paymentStatus: "paid", itemCount: 2 },
    ],
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    fullName: "Vikram Nair",
    email: "vikram.nair@example.com",
    phone: "+91 94470 44444",
    active: true,
    deleted: false,
    joinedDaysAgo: 3,
    address: { line1: "22 Marine Drive", city: "Kochi", state: "Kerala", pincode: "682031" },
    orders: [],
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    fullName: "Deepa Menon",
    email: "deepa.menon@example.com",
    phone: "+91 90030 55555",
    active: false,
    deleted: false,
    joinedDaysAgo: 300,
    address: { line1: "9 Brigade Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
    orders: [{ daysAgo: 250, status: "cancelled", paymentStatus: "refunded", itemCount: 1 }],
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    fullName: "Sameer Ali",
    email: "sameer.ali@example.com",
    phone: "+91 98860 66666",
    active: false,
    deleted: true,
    joinedDaysAgo: 400,
    address: { line1: "3 Residency Road", city: "Chennai", state: "Tamil Nadu", pincode: "600002" },
    orders: [{ daysAgo: 380, status: "delivered", paymentStatus: "paid", itemCount: 1 }],
  },
];

interface CatalogueItem {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  sku: string;
  price: number;
  featuredImage: string;
}

async function loadCatalogue(): Promise<CatalogueItem[]> {
  const { data, error } = await db
    .from("product_variants")
    .select("id, variant_name, sku, price, product:products(id, name, slug, featured_image)")
    .eq("status", "active")
    .limit(12);
  if (error) throw error;

  const items: CatalogueItem[] = [];
  for (const row of data ?? []) {
    const product = row.product as unknown as {
      id: string;
      name: string;
      slug: string;
      featured_image: string;
    } | null;
    if (!product) continue;
    items.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantId: row.id,
      variantName: row.variant_name,
      sku: row.sku,
      price: row.price,
      featuredImage: product.featured_image,
    });
  }
  return items;
}

let orderSeq = 0;
function orderNumber(): string {
  orderSeq += 1;
  return `AKP-SEED-${String(Date.now()).slice(-6)}-${String(orderSeq).padStart(3, "0")}`;
}

async function main() {
  const catalogue = await loadCatalogue();
  if (catalogue.length === 0) {
    throw new Error("No active product variants found. Run `npm run seed:catalogue` first.");
  }

  const ids = SEED.map((c) => c.id);

  // Clean slate for seed customers only (orders cascade to order_items).
  await db.from("orders").delete().in("customer_id", ids);
  await db.from("addresses").delete().in("customer_id", ids);
  await db.from("customers").delete().in("id", ids);

  // Customers
  const customerRows: TablesInsert<"customers">[] = SEED.map((c) => ({
    id: c.id,
    email: c.email,
    full_name: c.fullName,
    phone: c.phone,
    active: c.active,
    deleted_at: c.deleted ? daysAgo(1) : null,
    created_at: daysAgo(c.joinedDaysAgo),
  }));
  const { error: custErr } = await db.from("customers").insert(customerRows);
  if (custErr) throw custErr;

  // Addresses
  const addressRows: TablesInsert<"addresses">[] = SEED.map((c) => ({
    customer_id: c.id,
    line1: c.address.line1,
    city: c.address.city,
    state: c.address.state,
    pincode: c.address.pincode,
    country: "India",
    is_default: true,
  }));
  const { error: addrErr } = await db.from("addresses").insert(addressRows);
  if (addrErr) throw addrErr;

  // Orders + items
  let totalOrders = 0;
  for (const customer of SEED) {
    for (const order of customer.orders) {
      const items = Array.from({ length: order.itemCount }, (_, i) => catalogue[(totalOrders + i) % catalogue.length]);
      const subtotal = items.reduce((sum, item) => sum + item.price, 0);
      const shipping = subtotal >= 50000 ? 0 : 5000;
      const total = subtotal + shipping;
      const createdAt = daysAgo(order.daysAgo);

      const orderInsert: TablesInsert<"orders"> = {
        order_number: orderNumber(),
        customer_id: customer.id,
        contact_name: customer.fullName,
        contact_email: customer.email,
        contact_phone: customer.phone,
        ship_line1: customer.address.line1,
        ship_city: customer.address.city,
        ship_state: customer.address.state,
        ship_pincode: customer.address.pincode,
        ship_country: "India",
        delivery_method: "standard",
        subtotal,
        shipping,
        tax: 0,
        discount: 0,
        total,
        currency: "INR",
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: "razorpay",
        payment_timestamp: order.paymentStatus === "paid" ? createdAt : null,
        created_at: createdAt,
      };

      const { data: inserted, error: orderErr } = await db
        .from("orders")
        .insert(orderInsert)
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      const itemRows: TablesInsert<"order_items">[] = items.map((item) => ({
        order_id: inserted.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        product_slug: item.productSlug,
        variant_name: item.variantName,
        sku: item.sku,
        featured_image: item.featuredImage,
        unit_price: item.price,
        quantity: 1,
        line_total: item.price,
        currency: "INR",
      }));
      const { error: itemsErr } = await db.from("order_items").insert(itemRows);
      if (itemsErr) throw itemsErr;

      totalOrders += 1;
    }
  }

  console.log(`Seeded ${SEED.length} customers, ${SEED.length} addresses and ${totalOrders} orders.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
