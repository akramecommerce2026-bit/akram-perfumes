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
