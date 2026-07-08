# Backend (Supabase)

Backend foundation for Akram Perfumes. This phase prepares the architecture —
schema, security, typed data-access — **without** an Admin Dashboard, Razorpay
integration, or authentication (those come in later phases).

## Architecture

```
lib/supabase/
  env.ts            Validated env access + isSupabaseConfigured()
  client.ts         Typed anon client (RLS-protected) — reads
  admin.ts          Service-role client (server-only) — privileged writes/seed
  database.types.ts Generated-style DB types (single source of truth for types)
  mappers.ts        DB rows → domain records
services/
  product-service.ts        Read service (unchanged public API)
  order-service.ts          Order service (mock today; Supabase-ready)
  repositories/
    product-repository.ts           Interface (Dependency Inversion)
    mock-product-repository.ts       In-memory (fallback)
    supabase-product-repository.ts   Supabase implementation
    supabase-order-repository.ts     Supabase orders (prepared for Razorpay phase)
    index.ts                         Factory: Supabase when configured, else mock
supabase/
  migrations/*.sql  Schema + RLS
  seed.sql          Category seed
scripts/seed-catalogue.ts  Seeds full catalogue from lib/ data
```

**Components never fetch data directly.** They call services, which depend on a
repository *interface*. The factory (`getProductRepository`) returns the
Supabase repository when `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
are set, and the in-memory mock otherwise — so the app always builds and runs,
and goes live with zero code changes.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` → `.env.local` and fill in the URL, anon key and
   service-role key (Project Settings → API).
3. Apply the schema and policies (SQL editor or Supabase CLI):
   - `supabase/migrations/0001_initial_schema.sql`
   - `supabase/migrations/0002_row_level_security.sql`
   - `supabase/seed.sql`
4. Seed the catalogue from the app's existing data:
   ```
   npm run seed:catalogue
   ```
5. (Optional) Regenerate types after schema changes:
   ```
   npm run types:generate   # requires the Supabase CLI, project linked
   ```

## Data model

Normalized: `categories`, `products`, `product_variants`, `product_images`,
`fragrance_notes`, `profiles`, `customers`, `addresses`, `orders`,
`order_items`. Money is stored as **integer paise**. Catalogue tables use the
app's stable text ids; commerce tables use uuids.

## Security (RLS)

RLS is enabled on every table. The anon role can read only the **active**
catalogue. Customer/order data is private and owner-scoped (ready for auth).
The service-role key bypasses RLS and is **server-only** — never exposed to the
browser (`admin.ts` imports `server-only` so a client bundle fails to build).

## Payments (Razorpay only)

The site exposes a single method: **Secure Payment via Razorpay**. The `orders`
table already carries `razorpay_order_id`, `razorpay_payment_id`,
`razorpay_signature`, `payment_status`, `payment_method` and
`payment_timestamp`, so the gateway integrates next phase with no schema or
architectural change. `SupabaseOrderRepository` creates orders as `pending`;
the verification step will settle them.
