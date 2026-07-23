-- =============================================================================
-- Akram Perfumes — Signature Collections (homepage CMS)
-- =============================================================================
-- Makes the homepage Signature Collection section admin-manageable: every piece
-- of copy, both images, the call-to-action and the ordering live here instead of
-- being hardcoded in the component. The storefront renders active rows ordered
-- by display_order; hiding a row (active = false) removes it from the homepage.
--
-- Images reuse the existing `product-images` Storage bucket (folder: signature).
-- Fully idempotent + safe to re-run.
-- =============================================================================

create table if not exists signature_collections (
  id               text primary key,
  title            text not null,
  subtitle         text,
  description      text,
  background_image text,
  collection_image text,
  button_text      text,
  button_url       text,
  display_order    integer not null default 0,
  active           boolean not null default true,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists signature_collections_display_idx
  on signature_collections (active, display_order);
create index if not exists signature_collections_deleted_at_idx
  on signature_collections (deleted_at);

create or replace trigger signature_collections_set_updated_at
  before update on signature_collections
  for each row execute function set_updated_at();

-- Public read: only active, non-deleted rows reach the storefront. Writes go
-- through the admin service-role client, which bypasses RLS.
alter table signature_collections enable row level security;

drop policy if exists "Signature collections are publicly readable" on signature_collections;
create policy "Signature collections are publicly readable"
  on signature_collections for select
  using (active = true and deleted_at is null);

-- Seed the section the homepage shipped with, so the storefront keeps rendering
-- immediately after this migration. Re-running never overwrites admin edits.
--
-- The button points at the Bin Sheikh product page: `bin-sheikh` is a product
-- slug, not a category, so `/shop?collection=bin-sheikh` would match no category
-- and list the whole catalogue. `/shop?collection=<category-slug>` (e.g.
-- `perfumes`) preselects a category — change Button URL in the admin to switch.
insert into signature_collections (
  id, title, subtitle, description, collection_image, button_text, button_url, display_order, active
) values (
  'sig_bin_sheikh',
  'Bin Sheikh',
  'Signature Collection',
  'A masterpiece crafted with rich oriental notes, refined elegance, and exceptional longevity.',
  '/signature/bin-sheikh.webp',
  'Shop Bin Sheikh',
  '/shop/bin-sheikh',
  0,
  true
)
on conflict (id) do nothing;
