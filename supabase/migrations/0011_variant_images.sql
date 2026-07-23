-- ---------------------------------------------------------------------------
-- 0011_variant_images
--
-- Per-variant image galleries.
--
-- Adds a nullable `variant_id` to product_images. The design is additive and
-- backwards compatible:
--
--   * variant_id IS NULL  → a shared, product-level image (the existing gallery
--     and the featured/card image). Every image created before this migration
--     keeps variant_id NULL and behaves exactly as before.
--   * variant_id = <id>   → an image that belongs to one variant only. The
--     storefront shows these in place of the shared gallery when that variant is
--     selected, and falls back to the shared gallery for variants that have none.
--
-- No image is duplicated: a product-level photo is stored once and shown for
-- every variant without its own set. This scales to hundreds of products.
--
-- The existing `product_images_one_primary_idx` (unique primary per product) is
-- unaffected: only shared images are ever marked primary; variant images are
-- always written with is_primary = false.
-- ---------------------------------------------------------------------------

alter table product_images
  add column if not exists variant_id text
  references product_variants (id) on delete cascade;

create index if not exists product_images_variant_id_idx
  on product_images (variant_id);
