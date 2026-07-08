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
