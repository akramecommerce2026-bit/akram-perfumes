-- =============================================================================
-- Akram Perfumes — Store Settings
-- =============================================================================
-- A single-row settings store for admin-editable store configuration (store
-- name/description, business info, tax/shipping preferences, social links, SEO
-- defaults). Kept as one JSONB document so new settings never need a schema
-- change. Written only by the admin (service-role); not publicly readable.
--
-- Fully idempotent + safe to re-run.
-- =============================================================================

create table if not exists store_settings (
  id         smallint primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = 1)
);

insert into store_settings (id, data) values (1, '{}'::jsonb)
on conflict (id) do nothing;

create or replace trigger store_settings_set_updated_at
  before update on store_settings
  for each row execute function set_updated_at();

-- Admin-only: writes/reads go through the service-role client. No anon or
-- authenticated policies are defined, so RLS denies all other access.
alter table store_settings enable row level security;
