import "server-only";

import { createMoney } from "@/lib/money";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Money } from "@/types/money";
import type { PaymentStatus } from "@/types/checkout";
import type { ShipmentStatus } from "@/types/shipment";

export interface AccountOrder {
  readonly id: string;
  readonly orderNumber: string;
  readonly total: Money;
  readonly itemCount: number;
  readonly paymentStatus: PaymentStatus;
  readonly shipmentStatus: ShipmentStatus;
  readonly createdAt: string;
}

export interface AccountAddress {
  readonly line1: string;
  readonly line2: string;
  readonly landmark: string;
  readonly city: string;
  readonly state: string;
  readonly pincode: string;
  readonly country: string;
}

export interface AccountData {
  readonly orders: readonly AccountOrder[];
  readonly addresses: readonly AccountAddress[];
  readonly orderCount: number;
  readonly totalSpent: Money;
}

interface OrderRow {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  shipment_status: string;
  created_at: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_landmark: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  order_items: { id: string }[];
}

/**
 * Read service for the customer account area. Matches orders to the signed-in
 * user by their (snapshotted) contact email using the service-role client — so
 * both guest-checkout and linked orders surface. Server-only.
 */
export const accountService = {
  async getAccountData(email: string): Promise<AccountData> {
    const term = email.trim();
    if (!term) return { orders: [], addresses: [], orderCount: 0, totalSpent: createMoney(0) };

    const db = getSupabaseAdminClient();
    const { data, error } = await db
      .from("orders")
      .select(
        "id, order_number, total, payment_status, shipment_status, created_at, " +
          "ship_line1, ship_line2, ship_landmark, ship_city, ship_state, ship_pincode, ship_country, " +
          "order_items(id)",
      )
      .ilike("contact_email", term)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = (data ?? []) as unknown as OrderRow[];

    const orders: AccountOrder[] = rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      total: createMoney(row.total),
      itemCount: row.order_items?.length ?? 0,
      paymentStatus: row.payment_status as PaymentStatus,
      shipmentStatus: row.shipment_status as ShipmentStatus,
      createdAt: row.created_at,
    }));

    // Distinct saved addresses derived from the customer's order shipping snapshots.
    const addressMap = new Map<string, AccountAddress>();
    for (const row of rows) {
      const key = `${row.ship_line1}|${row.ship_pincode}`.toLowerCase();
      if (addressMap.has(key)) continue;
      addressMap.set(key, {
        line1: row.ship_line1,
        line2: row.ship_line2 ?? "",
        landmark: row.ship_landmark ?? "",
        city: row.ship_city,
        state: row.ship_state,
        pincode: row.ship_pincode,
        country: row.ship_country,
      });
    }

    const totalSpent = rows
      .filter((row) => row.payment_status === "paid")
      .reduce((sum, row) => sum + row.total, 0);

    return {
      orders,
      addresses: [...addressMap.values()],
      orderCount: orders.length,
      totalSpent: createMoney(totalSpent),
    };
  },
};
