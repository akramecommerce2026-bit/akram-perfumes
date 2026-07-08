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
create type gender as enum ('men', 'women', 'unisex');
create type fragrance_family as enum ('oriental', 'woody', 'floral', 'fresh', 'musk', 'oud');
create type occasion as enum ('everyday', 'office', 'evening', 'festive', 'signature');
create type season as enum ('spring', 'summer', 'autumn', 'winter');
create type variant_status as enum ('active', 'inactive');
create type weight_unit as enum ('g', 'kg', 'ml', 'l');
create type note_type as enum ('top', 'heart', 'base');

-- Order lifecycle (spec: Pending → Confirmed → Packed → Shipped → Delivered / Cancelled)
create type order_status as enum ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled');

-- Payment lifecycle. The project settles exclusively through Razorpay; the
-- gateway handles the actual method (UPI, cards, netbanking, wallets) internally.
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

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
create table categories (
  id            text primary key,
  name          text not null,
  slug          text not null unique,
  description   text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index categories_display_order_idx on categories (display_order);

create trigger categories_set_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table products (
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

create index products_category_id_idx on products (category_id);
create index products_slug_idx on products (slug);
create index products_active_idx on products (active);
create index products_is_featured_idx on products (is_featured) where is_featured;
create index products_is_signature_idx on products (is_signature) where is_signature;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product_variants
-- ---------------------------------------------------------------------------
-- Named `variant_name` (not `size`) so a variant can be a volume ("6ml"), a
-- format ("Roll-On") or a bundle — the architecture supports unlimited future
-- variant types managed from the Admin Panel. Prices are integer paise.
create table product_variants (
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

create index product_variants_product_id_idx on product_variants (product_id);
create index product_variants_status_idx on product_variants (status);

create trigger product_variants_set_updated_at
  before update on product_variants
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images (multiple per product; one primary; ordered)
-- ---------------------------------------------------------------------------
create table product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references products (id) on delete cascade,
  url           text not null,
  alt           text not null default '',
  is_primary    boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index product_images_product_id_idx on product_images (product_id);
-- At most one primary image per product.
create unique index product_images_one_primary_idx
  on product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------------
-- fragrance_notes (top / heart / base, ordered)
-- ---------------------------------------------------------------------------
create table fragrance_notes (
  id            uuid primary key default gen_random_uuid(),
  product_id    text not null references products (id) on delete cascade,
  note_type     note_type not null,
  note          text not null,
  display_order integer not null default 0
);

create index fragrance_notes_product_id_idx on fragrance_notes (product_id);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users — populated once authentication is added)
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- customers (a buyer; may be a guest or later linked to a profile)
-- ---------------------------------------------------------------------------
create table customers (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  email      text not null,
  full_name  text not null,
  phone      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_email_idx on customers (lower(email));
create index customers_profile_id_idx on customers (profile_id);

create trigger customers_set_updated_at
  before update on customers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
create table addresses (
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

create index addresses_customer_id_idx on addresses (customer_id);

create trigger addresses_set_updated_at
  before update on addresses
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
-- Contact + shipping address are snapshotted so an order stays complete even if
-- the customer/address is later edited or removed. Razorpay columns are present
-- but empty until the payment phase wires the gateway — no future migration
-- needed to go live with Razorpay order/payment/signature verification.
create table orders (
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

create index orders_customer_id_idx on orders (customer_id);
create index orders_status_idx on orders (status);
create index orders_payment_status_idx on orders (payment_status);
create index orders_razorpay_order_id_idx on orders (razorpay_order_id);
create index orders_created_at_idx on orders (created_at desc);

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items (immutable denormalized snapshot of each purchased line)
-- ---------------------------------------------------------------------------
create table order_items (
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

create index order_items_order_id_idx on order_items (order_id);
