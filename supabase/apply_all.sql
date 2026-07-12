-- =============================================================================
-- Akram Perfumes — combined setup (schema + RLS + products + categories + seed).
-- FULLY IDEMPOTENT: safe on empty or existing DB, and safe to re-run.
-- Paste into the Supabase SQL Editor and Run.
-- =============================================================================

-- =============================================================================
-- Akram Perfumes — initial schema
-- =============================================================================
-- Normalized catalogue + commerce schema. Money is stored as integer minor
-- units (paise) to mirror the app's Money value object and avoid float drift.
--
-- Catalogue tables (categories, products, variants, images, notes) use
-- application-provided text ids so they map 1:1 onto the existing domain ids
-- and stay human-readable. Commerce tables (customers, addresses, orders) use
-- generated uuids. Profiles are keyed by auth.users.id for future auth.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (single source of truth for taxonomies; mirrors types/*.ts)
-- ---------------------------------------------------------------------------
-- Postgres has no `create type if not exists`, so each enum is guarded by a
-- catalog check. Adding a new value later should use `alter type ... add value`
-- in a follow-up migration, never a redefinition here.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'gender') then
    create type gender as enum ('men', 'women', 'unisex');
  end if;
  if not exists (select 1 from pg_type where typname = 'fragrance_family') then
    create type fragrance_family as enum ('oriental', 'woody', 'floral', 'fresh', 'musk', 'oud');
  end if;
  if not exists (select 1 from pg_type where typname = 'occasion') then
    create type occasion as enum ('everyday', 'office', 'evening', 'festive', 'signature');
  end if;
  if not exists (select 1 from pg_type where typname = 'season') then
    create type season as enum ('spring', 'summer', 'autumn', 'winter');
  end if;
  if not exists (select 1 from pg_type where typname = 'variant_status') then
    create type variant_status as enum ('active', 'inactive');
  end if;
  if not exists (select 1 from pg_type where typname = 'weight_unit') then
    create type weight_unit as enum ('g', 'kg', 'ml', 'l');
  end if;
  if not exists (select 1 from pg_type where typname = 'note_type') then
    create type note_type as enum ('top', 'heart', 'base');
  end if;
  -- Order lifecycle: Pending → Confirmed → Packed → Shipped → Delivered / Cancelled
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum
      ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');
  end if;
  -- Payment lifecycle. Settlement is exclusively via Razorpay; the gateway
  -- handles the actual method (UPI, cards, netbanking, wallets) internally.
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id            text primary key,
  name          text not null,
  slug          text not null unique,
  description   text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists categories_display_order_idx on categories (display_order);

create or replace trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id                text primary key,
  name              text not null,
  slug              text not null unique,
  category_id       text not null references categories (id) on delete restrict,
  short_description text not null default '',
  description       text not null default '',
  featured_image    text not null default '',
  gender            gender not null default 'unisex',
  fragrance_family  fragrance_family not null default 'oriental',
  occasions         occasion[] not null default '{}',
  -- Fragrance profile (denormalized single-row attributes)
  concentration     text not null default '',
  longevity         smallint not null default 0 check (longevity between 0 and 5),
  projection        smallint not null default 0 check (projection between 0 and 5),
  seasons           season[] not null default '{}',
  -- Aggregates maintained by reviews (kept here for fast listing reads)
  rating            numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count      integer not null default 0 check (review_count >= 0),
  is_featured       boolean not null default false,
  is_signature      boolean not null default false,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_slug_idx on products (slug);
create index if not exists products_active_idx on products (active);
create index if not exists products_is_featured_idx on products (is_featured) where is_featured;
create index if not exists products_is_signature_idx on products (is_signature) where is_signature;

create or replace trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------
-- Named `variant_name` (not `size`) so a variant can be a volume ("6ml"), a
-- format ("Roll-On") or a bundle — the architecture supports unlimited future
-- variant types managed from the Admin Panel. Prices are integer paise.
create table if not exists product_variants (
  id            text primary key,
  product_id    text not null references products (id) on delete cascade,
  variant_name  text not null,
  price         integer not null check (price >= 0),
  compare_price integer check (compare_price >= 0),
  currency      text not null default 'INR',
  sku           text not null unique,
  stock         integer not null default 0 check (stock >= 0),
  weight_value  numeric(10, 2),
  weight_unit   weight_unit,
  status        variant_status not null default 'active',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);
create index if not exists product_variants_status_idx on product_variants (status);

create or replace trigger product_variants_set_updated_at
  before update on product_variants
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images (multiple per product; one primary; ordered)
-- ---------------------------------------------------------------------------
create table if not exists product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references products (id) on delete cascade,
  url           text not null,
  alt           text not null default '',
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on product_images (product_id);
-- At most one primary image per product.
create unique index if not exists product_images_one_primary_idx
  on product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------------
-- fragrance_notes (top / heart / base, ordered)
-- ---------------------------------------------------------------------------
create table if not exists fragrance_notes (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references products (id) on delete cascade,
  note_type     note_type not null,
  note          text not null,
  display_order integer not null default 0
);

create index if not exists fragrance_notes_product_id_idx on fragrance_notes (product_id);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users — populated once authentication is added)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- customers (a buyer; may be a guest or later linked to a profile)
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  email      text not null,
  full_name  text not null,
  phone      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_email_idx on customers (lower(email));
create index if not exists customers_profile_id_idx on customers (profile_id);

create or replace trigger customers_set_updated_at
  before update on customers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  line1       text not null,
  line2       text,
  landmark    text,
  city        text not null,
  state       text not null,
  pincode     text not null,
  country     text not null default 'India',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists addresses_customer_id_idx on addresses (customer_id);

create or replace trigger addresses_set_updated_at
  before update on addresses
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
-- Contact + shipping address are snapshotted so an order stays complete even if
-- the customer/address is later edited or removed. Razorpay columns are present
-- but empty until the payment phase wires the gateway — no future migration
-- needed to go live with Razorpay order/payment/signature verification.
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  customer_id        uuid references customers (id) on delete set null,

  -- Contact snapshot
  contact_name       text not null,
  contact_email      text not null,
  contact_phone      text not null,

  -- Shipping address snapshot
  ship_line1         text not null,
  ship_line2         text,
  ship_landmark      text,
  ship_city          text not null,
  ship_state         text not null,
  ship_pincode       text not null,
  ship_country       text not null default 'India',

  delivery_method    text not null default 'standard',

  -- Money breakdown (integer paise)
  subtotal           integer not null check (subtotal >= 0),
  shipping           integer not null default 0 check (shipping >= 0),
  tax                integer not null default 0 check (tax >= 0),
  discount           integer not null default 0 check (discount >= 0),
  total              integer not null check (total >= 0),
  currency           text not null default 'INR',

  status             order_status not null default 'pending',

  -- Payment (Razorpay only)
  payment_status     payment_status not null default 'pending',
  payment_method     text not null default 'razorpay',
  razorpay_order_id  text,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_timestamp  timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on orders (customer_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_payment_status_idx on orders (payment_status);
create index if not exists orders_razorpay_order_id_idx on orders (razorpay_order_id);
create index if not exists orders_created_at_idx on orders (created_at desc);

create or replace trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items (immutable denormalized snapshot of each purchased line)
-- ---------------------------------------------------------------------------
create table if not exists order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders (id) on delete cascade,
  product_id     text references products (id) on delete set null,
  variant_id     text references product_variants (id) on delete set null,
  product_name   text not null,
  product_slug   text not null default '',
  variant_name   text not null,
  sku            text not null,
  featured_image text not null default '',
  unit_price     integer not null check (unit_price >= 0),
  quantity       integer not null check (quantity > 0),
  line_total     integer not null check (line_total >= 0),
  currency       text not null default 'INR',
  created_at     timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on order_items (order_id);


-- =============================================================================
-- Akram Perfumes — Row Level Security
-- =============================================================================
-- RLS is enabled on every table. The public (anon) role gets read-only access
-- to the *active* catalogue only. Commerce data (customers, addresses, orders)
-- is private and owner-scoped, ready for authentication in a later phase.
--
-- The service-role key bypasses RLS, so server-side admin/seed/order-write code
-- is unaffected by these policies. Never expose the service-role key to the
-- browser.
-- =============================================================================

alter table categories        enable row level security;
alter table products          enable row level security;
alter table product_variants  enable row level security;
alter table product_images    enable row level security;
alter table fragrance_notes   enable row level security;
alter table profiles          enable row level security;
alter table customers         enable row level security;
alter table addresses         enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;

-- ---------------------------------------------------------------------------
-- Catalogue: public read (anon + authenticated)
-- ---------------------------------------------------------------------------
drop policy if exists "Categories are publicly readable" on categories;
create policy "Categories are publicly readable"
  on categories for select
  using (true);

drop policy if exists "Active products are publicly readable" on products;
create policy "Active products are publicly readable"
  on products for select
  using (active = true);

drop policy if exists "Active variants are publicly readable" on product_variants;
create policy "Active variants are publicly readable"
  on product_variants for select
  using (
    status = 'active'
    and exists (
      select 1 from products p
      where p.id = product_variants.product_id and p.active = true
    )
  );

drop policy if exists "Images of active products are publicly readable" on product_images;
create policy "Images of active products are publicly readable"
  on product_images for select
  using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id and p.active = true
    )
  );

drop policy if exists "Notes of active products are publicly readable" on fragrance_notes;
create policy "Notes of active products are publicly readable"
  on fragrance_notes for select
  using (
    exists (
      select 1 from products p
      where p.id = fragrance_notes.product_id and p.active = true
    )
  );

-- ---------------------------------------------------------------------------
-- Profiles: a user manages only their own profile
-- ---------------------------------------------------------------------------
drop policy if exists "Users can read their own profile" on profiles;
create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Customers / Addresses: owner-scoped via the linked profile
-- ---------------------------------------------------------------------------
-- No anon policies → guest customers/orders are created server-side with the
-- service-role key. Once auth lands, registered users read their own records.
drop policy if exists "Users can read their own customer record" on customers;
create policy "Users can read their own customer record"
  on customers for select
  using (profile_id = auth.uid());

drop policy if exists "Users can read their own addresses" on addresses;
create policy "Users can read their own addresses"
  on addresses for select
  using (
    exists (
      select 1 from customers c
      where c.id = addresses.customer_id and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can manage their own addresses" on addresses;
create policy "Users can manage their own addresses"
  on addresses for all
  using (
    exists (
      select 1 from customers c
      where c.id = addresses.customer_id and c.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from customers c
      where c.id = addresses.customer_id and c.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Orders / Order items: owner-scoped, read-only to the customer
-- ---------------------------------------------------------------------------
-- Writes happen server-side (service role) after Razorpay verification. Anon
-- has no access; authenticated users can read their own orders.
drop policy if exists "Users can read their own orders" on orders;
create policy "Users can read their own orders"
  on orders for select
  using (
    exists (
      select 1 from customers c
      where c.id = orders.customer_id and c.profile_id = auth.uid()
    )
  );

drop policy if exists "Users can read their own order items" on order_items;
create policy "Users can read their own order items"
  on order_items for select
  using (
    exists (
      select 1
      from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_items.order_id and c.profile_id = auth.uid()
    )
  );


-- =============================================================================
-- Akram Perfumes — Products Management
-- =============================================================================
-- Adds the columns the Admin product editor needs (brand, SEO, soft-delete,
-- per-variant low-stock threshold) and the Storage bucket for product images.
-- Fully idempotent: safe to run on the existing database and to re-run.
-- =============================================================================

-- Products: brand, SEO and soft-delete ---------------------------------------
alter table products
  add column if not exists brand            text not null default 'Akram Perfumes',
  add column if not exists meta_title       text,
  add column if not exists meta_description text,
  add column if not exists keywords         text[] not null default '{}',
  add column if not exists og_image         text,
  add column if not exists deleted_at       timestamptz;

create index if not exists products_deleted_at_idx on products (deleted_at);

-- Variants: per-variant low-stock threshold ----------------------------------
alter table product_variants
  add column if not exists low_stock_threshold integer not null default 5
    check (low_stock_threshold >= 0);

-- Customer-facing reads must never expose soft-deleted products.
drop policy if exists "Active products are publicly readable" on products;
create policy "Active products are publicly readable"
  on products for select
  using (active = true and deleted_at is null);

-- ---------------------------------------------------------------------------
-- Storage: product-images bucket (public read; writes via service role only)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');


-- =============================================================================
-- Akram Perfumes — Categories Management
-- =============================================================================
-- Adds the columns the admin category editor needs (image, SEO, status,
-- soft-delete) and tightens the public read policy so hidden/soft-deleted
-- categories never appear on the storefront. Idempotent + safe to re-run.
-- Category images reuse the existing `product-images` Storage bucket.
-- =============================================================================

alter table categories
  add column if not exists image_url        text,
  add column if not exists meta_title       text,
  add column if not exists meta_description text,
  add column if not exists active           boolean not null default true,
  add column if not exists deleted_at       timestamptz;

create index if not exists categories_active_idx on categories (active);
create index if not exists categories_deleted_at_idx on categories (deleted_at);

-- Public read: only active, non-deleted categories are visible on the storefront.
drop policy if exists "Categories are publicly readable" on categories;
create policy "Categories are publicly readable"
  on categories for select
  using (active = true and deleted_at is null);


-- =============================================================================
-- Akram Perfumes — seed data
-- =============================================================================
-- Seeds the category taxonomy. The full product catalogue (products, variants,
-- images, notes) is seeded from the app's existing mock data via
-- `scripts/seed-catalogue.ts`, which keeps a single source of truth and stays
-- in sync as the mock evolves. Run: `npm run seed:catalogue` (service-role key
-- required) after applying migrations.
-- =============================================================================

insert into categories (id, name, slug, description, display_order) values
  ('cat_attars',          'Attars',          'attars',          'Pure oil-based fragrances with lasting depth.', 1),
  ('cat_perfumes',        'Perfumes',        'perfumes',        'Signature eaux de parfum for every occasion.',  2),
  ('cat_incense',         'Incense',         'incense',         'Bakhoor and oud to perfume your space.',        3),
  ('cat_solid_perfumes',  'Solid Perfumes',  'solid-perfumes',  'Travel-ready balms crafted for life in motion.', 4)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  display_order = excluded.display_order;


-- =============================================================================
-- Akram Perfumes — Customers Management
-- =============================================================================
-- Adds the account-state columns the Admin customer directory needs
-- (activate / deactivate + soft-delete) and backfills real customer records
-- from any existing guest orders. Fully idempotent + safe to re-run.
-- Customers are NEVER hard-deleted from the admin — `deleted_at` is a soft
-- delete so historical orders (which reference customer_id) stay intact.
-- =============================================================================

alter table customers
  add column if not exists active     boolean not null default true,
  add column if not exists deleted_at timestamptz;

create index if not exists customers_active_idx on customers (active);
create index if not exists customers_deleted_at_idx on customers (deleted_at);

drop policy if exists "Users can read their own customer record" on customers;
create policy "Users can read their own customer record"
  on customers for select
  using (profile_id = auth.uid() and deleted_at is null);

insert into customers (email, full_name, phone, created_at)
select
  lower(o.contact_email)                                    as email,
  (array_agg(o.contact_name order by o.created_at desc))[1] as full_name,
  (array_agg(o.contact_phone order by o.created_at desc))[1] as phone,
  min(o.created_at)                                         as created_at
from orders o
where o.customer_id is null
  and o.contact_email is not null
  and length(trim(o.contact_email)) > 0
  and not exists (
    select 1 from customers c where lower(c.email) = lower(o.contact_email)
  )
group by lower(o.contact_email);

update orders o
set customer_id = c.id
from customers c
where o.customer_id is null
  and lower(o.contact_email) = lower(c.email);

insert into addresses (customer_id, line1, line2, landmark, city, state, pincode, country, is_default)
select distinct on (o.customer_id)
  o.customer_id, o.ship_line1, o.ship_line2, o.ship_landmark,
  o.ship_city, o.ship_state, o.ship_pincode, o.ship_country, true
from orders o
where o.customer_id is not null
  and not exists (select 1 from addresses a where a.customer_id = o.customer_id)
order by o.customer_id, o.created_at desc;


-- =============================================================================
-- Akram Perfumes — Manual Shipment Tracking
-- =============================================================================
-- Extends orders with manual courier/shipment fields + an append-only
-- order_tracking_events timeline, with a trigger that auto-logs an event on
-- every shipment-status change. Fully idempotent + safe to re-run.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'shipment_status') then
    create type shipment_status as enum (
      'pending', 'confirmed', 'packed', 'shipped',
      'out_for_delivery', 'delivered', 'cancelled', 'returned'
    );
  end if;
end
$$;

alter table orders
  add column if not exists courier_partner    text,
  add column if not exists tracking_number    text,
  add column if not exists tracking_url        text,
  add column if not exists shipment_status     shipment_status not null default 'pending',
  add column if not exists shipped_at          timestamptz,
  add column if not exists estimated_delivery  date,
  add column if not exists delivered_at        timestamptz,
  add column if not exists shipping_notes      text;

create index if not exists orders_shipment_status_idx on orders (shipment_status);
create index if not exists orders_tracking_number_idx on orders (tracking_number);

create table if not exists order_tracking_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders (id) on delete cascade,
  status     shipment_status,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_tracking_events_order_idx
  on order_tracking_events (order_id, created_at);

create or replace function log_shipment_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.shipment_status is distinct from old.shipment_status then
    insert into order_tracking_events (order_id, status, message)
    values (
      new.id,
      new.shipment_status,
      initcap(replace(new.shipment_status::text, '_', ' '))
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_shipment_status on orders;
create trigger orders_log_shipment_status
  after update of shipment_status on orders
  for each row execute function log_shipment_status_change();

alter table order_tracking_events enable row level security;

drop policy if exists "Users can read their own order tracking events" on order_tracking_events;
create policy "Users can read their own order tracking events"
  on order_tracking_events for select
  using (
    exists (
      select 1
      from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_tracking_events.order_id and c.profile_id = auth.uid()
    )
  );


-- =============================================================================
-- Akram Perfumes — Production Checkout / Orders
-- =============================================================================
-- Moves order creation from the in-memory mock to a real, transactional
-- Supabase pipeline:
--   • billing snapshot + idempotency columns on orders
--   • place_order()          — one transaction: upsert customer, insert order +
--                              items, atomically decrement variant stock (race-
--                              safe, no negative stock), log "Order Placed"
--   • confirm_order_payment() — idempotently mark paid + advance status + log
--                              "Payment Confirmed" (+ the shipment trigger logs
--                              "Confirmed")
-- Integrity guards: unique idempotency_key (no duplicate orders), unique
-- razorpay_payment_id (no duplicate payments), NOT EXISTS guards (no duplicate
-- tracking events).
--
-- Fully idempotent + safe to re-run.
-- =============================================================================

-- Orders: billing snapshot + idempotency ------------------------------------
alter table orders
  add column if not exists bill_name                text,
  add column if not exists bill_line1               text,
  add column if not exists bill_line2               text,
  add column if not exists bill_landmark            text,
  add column if not exists bill_city                text,
  add column if not exists bill_state               text,
  add column if not exists bill_pincode             text,
  add column if not exists bill_country             text,
  add column if not exists billing_same_as_shipping boolean not null default true,
  add column if not exists idempotency_key          text;

create unique index if not exists orders_idempotency_key_key
  on orders (idempotency_key) where idempotency_key is not null;

create unique index if not exists orders_razorpay_payment_id_key
  on orders (razorpay_payment_id) where razorpay_payment_id is not null;

-- ---------------------------------------------------------------------------
-- place_order(payload jsonb) -> jsonb  { order_id, order_number, reused }
-- ---------------------------------------------------------------------------
-- Runs as one transaction (a function is atomic): if any step fails — most
-- importantly an out-of-stock variant — everything rolls back, so an order is
-- never created with an inventory it couldn't reserve. Stock is decremented with
-- `UPDATE ... WHERE stock >= qty`, which takes a row lock and both prevents
-- negative stock and serializes concurrent buyers (race-safe).
create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_idem        text := nullif(payload->>'idempotency_key', '');
  v_email       text := lower(payload->'contact'->>'email');
  v_profile     uuid := nullif(payload->>'profile_id', '')::uuid;
  v_customer_id uuid;
  v_order_id    uuid;
  v_order_number text;
  v_item        jsonb;
  v_existing    orders%rowtype;
  v_rows        integer;
begin
  -- Idempotency: a repeated submit with the same key returns the first order.
  if v_idem is not null then
    select * into v_existing from orders where idempotency_key = v_idem limit 1;
    if found then
      return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number, 'reused', true);
    end if;
  end if;

  -- Upsert the customer by email (link the auth profile when signed in).
  select id into v_customer_id from customers where lower(email) = v_email limit 1;
  if v_customer_id is null then
    insert into customers (email, full_name, phone, profile_id)
    values (payload->'contact'->>'email', payload->'contact'->>'name', payload->'contact'->>'phone', v_profile)
    returning id into v_customer_id;
  elsif v_profile is not null then
    update customers set profile_id = coalesce(profile_id, v_profile) where id = v_customer_id;
  end if;

  -- Unique, human-readable order number.
  loop
    v_order_number := 'AKR-' || upper(substr(md5(random()::text), 1, 6)) || '-' || upper(substr(md5(random()::text), 1, 3));
    exit when not exists (select 1 from orders where order_number = v_order_number);
  end loop;

  insert into orders (
    order_number, customer_id, idempotency_key,
    contact_name, contact_email, contact_phone,
    ship_line1, ship_line2, ship_landmark, ship_city, ship_state, ship_pincode, ship_country,
    bill_name, bill_line1, bill_line2, bill_landmark, bill_city, bill_state, bill_pincode, bill_country, billing_same_as_shipping,
    delivery_method, subtotal, shipping, tax, discount, total, currency,
    status, payment_status, payment_method, shipment_status
  ) values (
    v_order_number, v_customer_id, v_idem,
    payload->'contact'->>'name', payload->'contact'->>'email', payload->'contact'->>'phone',
    payload->'shipping'->>'line1', nullif(payload->'shipping'->>'line2',''), nullif(payload->'shipping'->>'landmark',''),
    payload->'shipping'->>'city', payload->'shipping'->>'state', payload->'shipping'->>'pincode', coalesce(payload->'shipping'->>'country','India'),
    nullif(payload->'billing'->>'name',''), nullif(payload->'billing'->>'line1',''), nullif(payload->'billing'->>'line2',''), nullif(payload->'billing'->>'landmark',''),
    nullif(payload->'billing'->>'city',''), nullif(payload->'billing'->>'state',''), nullif(payload->'billing'->>'pincode',''), nullif(payload->'billing'->>'country',''),
    coalesce((payload->>'billing_same_as_shipping')::boolean, true),
    coalesce(payload->>'delivery_method','standard'),
    (payload->>'subtotal')::integer, (payload->>'shipping_fee')::integer, coalesce((payload->>'tax')::integer,0),
    coalesce((payload->>'discount')::integer,0), (payload->>'total')::integer, coalesce(payload->>'currency','INR'),
    'pending', 'pending', coalesce(payload->>'payment_method','razorpay'), 'pending'
  ) returning id into v_order_id;

  -- Items + atomic, race-safe stock decrement.
  for v_item in select value from jsonb_array_elements(payload->'items') loop
    insert into order_items (
      order_id, product_id, variant_id, product_name, product_slug, variant_name, sku, featured_image,
      unit_price, quantity, line_total, currency
    ) values (
      v_order_id, nullif(v_item->>'product_id',''), nullif(v_item->>'variant_id',''),
      v_item->>'product_name', coalesce(v_item->>'product_slug',''), v_item->>'variant_name', v_item->>'sku',
      coalesce(v_item->>'featured_image',''), (v_item->>'unit_price')::integer, (v_item->>'quantity')::integer,
      (v_item->>'line_total')::integer, coalesce(v_item->>'currency','INR')
    );

    if nullif(v_item->>'variant_id','') is not null then
      update product_variants
        set stock = stock - (v_item->>'quantity')::integer
        where id = v_item->>'variant_id' and stock >= (v_item->>'quantity')::integer;
      get diagnostics v_rows = row_count;
      if v_rows = 0 then
        raise exception 'INSUFFICIENT_STOCK:%', coalesce(v_item->>'sku', v_item->>'variant_id')
          using errcode = 'P0001';
      end if;
    end if;
  end loop;

  insert into order_tracking_events (order_id, status, message) values (v_order_id, null, 'Order Placed');

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'reused', false);
end;
$$;

-- ---------------------------------------------------------------------------
-- confirm_order_payment() — idempotent paid transition
-- ---------------------------------------------------------------------------
create or replace function confirm_order_payment(
  p_order_id uuid,
  p_payment_id text,
  p_signature text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_order.payment_status = 'paid' then
    return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'already_paid', true);
  end if;

  update orders set
    payment_status    = 'paid',
    payment_timestamp = now(),
    razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
    razorpay_signature  = coalesce(p_signature, razorpay_signature),
    status          = case when status = 'pending' then 'confirmed' else status end,
    shipment_status = case when shipment_status = 'pending' then 'confirmed' else shipment_status end
  where id = p_order_id;

  -- The orders_log_shipment_status trigger logs "Confirmed" for the shipment
  -- change; log the payment milestone here (guarded so it can't duplicate).
  insert into order_tracking_events (order_id, status, message)
  select p_order_id, null, 'Payment Confirmed'
  where not exists (
    select 1 from order_tracking_events where order_id = p_order_id and message = 'Payment Confirmed'
  );

  return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'already_paid', false);
end;
$$;

-- Callable by the service role (server actions run with it); not by anon.
revoke all on function place_order(jsonb) from anon, authenticated;
revoke all on function confirm_order_payment(uuid, text, text) from anon, authenticated;
grant execute on function place_order(jsonb) to service_role;
grant execute on function confirm_order_payment(uuid, text, text) to service_role;
