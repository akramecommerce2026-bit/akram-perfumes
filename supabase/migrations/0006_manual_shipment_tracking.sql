-- =============================================================================
-- Akram Perfumes — Manual Shipment Tracking
-- =============================================================================
-- Extends the existing orders table with manual courier/shipment fields and adds
-- an append-only `order_tracking_events` timeline. A trigger auto-logs an event
-- on every shipment-status change so the timeline stays complete no matter which
-- code path (admin action today, courier API webhook tomorrow) makes the update.
--
-- Fully idempotent: safe on the existing database and safe to re-run.
-- =============================================================================

-- Shipment lifecycle enum (superset of order_status: adds out_for_delivery +
-- returned). Kept separate from order_status so fulfilment tracking can evolve
-- independently of the commercial order state.
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

-- Orders: manual shipment tracking fields ------------------------------------
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

-- ---------------------------------------------------------------------------
-- order_tracking_events (append-only shipment timeline)
-- ---------------------------------------------------------------------------
-- `status` is nullable so future non-shipment events (e.g. courier exceptions)
-- can be logged with just a message. `message` is a denormalized human label so
-- the timeline reads correctly even if enum labels change later.
create table if not exists order_tracking_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders (id) on delete cascade,
  status     shipment_status,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_tracking_events_order_idx
  on order_tracking_events (order_id, created_at);

-- ---------------------------------------------------------------------------
-- Auto-log a timeline event whenever shipment_status changes
-- ---------------------------------------------------------------------------
-- Message is derived from the enum value ("out_for_delivery" -> "Out For
-- Delivery") so there is a single source of truth and no hardcoded label map.
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

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Writes happen server-side with the service role (RLS-bypassing). Authenticated
-- customers may read the tracking timeline for their own orders; anon has none
-- (the storefront tracking page reads server-side via the service role).
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
