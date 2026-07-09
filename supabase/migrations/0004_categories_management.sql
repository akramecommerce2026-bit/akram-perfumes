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
