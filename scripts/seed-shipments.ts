/**
 * Seeds demo shipment tracking onto the existing AKP-SEED demo orders so the
 * admin Shipping Management views and the customer /track page have realistic
 * data. Walking each order through a status sequence fires the DB trigger, which
 * appends one `order_tracking_events` row per transition — producing genuine
 * multi-step timelines.
 *
 * Idempotent: each run resets the seed orders' shipment state + clears their
 * tracking events before re-applying. Touches only AKP-SEED orders.
 *
 *   npx tsx --env-file=.env.local scripts/seed-shipments.ts
 */
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../lib/supabase/database.types";
import { getServiceRoleKey, isSupabaseConfigured, supabaseUrl } from "../lib/supabase/env";

if (!isSupabaseConfigured()) {
  throw new Error("Missing Supabase env. Run with: npx tsx --env-file=.env.local scripts/seed-shipments.ts");
}

const db = createClient<Database>(supabaseUrl, getServiceRoleKey(), { auth: { persistSession: false } });

type ShipmentStatus = Database["public"]["Enums"]["shipment_status"];
const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY).toISOString().slice(0, 10);

interface ShipmentProfile {
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  notes: string | null;
  sequence: ShipmentStatus[];
  shippedDaysAgo?: number;
  deliveredDaysAgo?: number;
}

// Rotating profiles applied to the seed orders by index — covers delivered,
// in-transit, packed, confirmed, cancelled and a still-pending order.
const PROFILES: ShipmentProfile[] = [
  {
    courier: "Delhivery",
    trackingNumber: "DLV1234567890",
    trackingUrl: "https://www.delhivery.com/track/package/DLV1234567890",
    estimatedDelivery: inDays(-2),
    notes: "Delivered and signed for.",
    sequence: ["confirmed", "packed", "shipped", "out_for_delivery", "delivered"],
    shippedDaysAgo: 5,
    deliveredDaysAgo: 2,
  },
  {
    courier: "Blue Dart",
    trackingNumber: "BD987654321",
    trackingUrl: "https://www.bluedart.com/tracking/BD987654321",
    estimatedDelivery: inDays(2),
    notes: "In transit via Mumbai hub.",
    sequence: ["confirmed", "packed", "shipped"],
    shippedDaysAgo: 1,
  },
  {
    courier: "DTDC",
    trackingNumber: "DTDC55501212",
    trackingUrl: null,
    estimatedDelivery: inDays(4),
    notes: "Packed, awaiting courier pickup.",
    sequence: ["confirmed", "packed"],
  },
  {
    courier: "India Post",
    trackingNumber: null,
    trackingUrl: null,
    estimatedDelivery: inDays(6),
    notes: "Order confirmed.",
    sequence: ["confirmed"],
  },
  {
    courier: null,
    trackingNumber: null,
    trackingUrl: null,
    estimatedDelivery: null,
    notes: "Customer requested cancellation.",
    sequence: ["confirmed", "cancelled"],
  },
];

async function resetOrder(orderId: string, profile: ShipmentProfile) {
  await db
    .from("orders")
    .update({
      shipment_status: "pending",
      courier_partner: profile.courier,
      tracking_number: profile.trackingNumber,
      tracking_url: profile.trackingUrl,
      estimated_delivery: profile.estimatedDelivery,
      shipping_notes: profile.notes,
      shipped_at: null,
      delivered_at: null,
    })
    .eq("id", orderId);
  // Clear any events (incl. a stray "pending" from the reset above).
  await db.from("order_tracking_events").delete().eq("order_id", orderId);
}

async function main() {
  const { data: orders, error } = await db
    .from("orders")
    .select("id, order_number")
    .ilike("order_number", "AKP-SEED-%")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!orders || orders.length === 0) {
    throw new Error("No AKP-SEED orders found. Run `npm run seed:customers` first.");
  }

  let updated = 0;
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const profile = PROFILES[i % PROFILES.length];
    await resetOrder(order.id, profile);

    // Walk the status sequence — each transition fires the trigger (one event).
    for (const status of profile.sequence) {
      const { error: upErr } = await db
        .from("orders")
        .update({ shipment_status: status })
        .eq("id", order.id);
      if (upErr) throw upErr;
    }

    // Stamp fulfilment timestamps for a realistic record.
    const patch: Record<string, string | null> = {};
    if (profile.shippedDaysAgo != null) {
      patch.shipped_at = new Date(Date.now() - profile.shippedDaysAgo * DAY).toISOString();
    }
    if (profile.deliveredDaysAgo != null) {
      patch.delivered_at = new Date(Date.now() - profile.deliveredDaysAgo * DAY).toISOString();
    }
    if (Object.keys(patch).length > 0) {
      await db.from("orders").update(patch).eq("id", order.id);
    }
    updated++;
  }

  console.log(`Seeded shipment tracking on ${updated} demo orders.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
