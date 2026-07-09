-- =============================================================================
-- Akram Perfumes — combined setup (schema + RLS + products-mgmt + seed).
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
