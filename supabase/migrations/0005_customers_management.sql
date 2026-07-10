-- =============================================================================
-- Akram Perfumes — Customers Management
-- =============================================================================
-- Adds the account-state columns the Admin customer directory needs
-- (activate / deactivate + soft-delete) and backfills real customer records
-- from any existing guest orders so purchase history, stats and the directory
-- have data even for orders placed before a customer was ever linked.
--
-- Fully idempotent: safe on the existing database and safe to re-run.
--
-- Customers are NEVER hard-deleted from the admin — `deleted_at` is a soft
-- delete so historical orders (which reference customer_id) stay intact.
-- =============================================================================

-- Customers: account status + soft-delete ------------------------------------
alter table customers
  add column if not exists active     boolean not null default true,
  add column if not exists deleted_at timestamptz;

create index if not exists customers_active_idx on customers (active);
create index if not exists customers_deleted_at_idx on customers (deleted_at);

-- Owner-scoped read must never expose a soft-deleted customer record.
drop policy if exists "Users can read their own customer record" on customers;
create policy "Users can read their own customer record"
  on customers for select
  using (profile_id = auth.uid() and deleted_at is null);

-- ---------------------------------------------------------------------------
-- Backfill: promote existing guest orders into real customer records
-- ---------------------------------------------------------------------------
-- Orders snapshot the buyer's contact details but may have been created without
-- a linked customer (guest checkout). Group those by email into one customer
-- each, then link every matching order back. Idempotent via NOT EXISTS guards.
insert into customers (email, full_name, phone, created_at)
select
  lower(o.contact_email)                                   as email,
  (array_agg(o.contact_name order by o.created_at desc))[1] as full_name,
  (array_agg(o.contact_phone order by o.created_at desc))[1] as phone,
  min(o.created_at)                                        as created_at
from orders o
where o.customer_id is null
  and o.contact_email is not null
  and length(trim(o.contact_email)) > 0
  and not exists (
    select 1 from customers c where lower(c.email) = lower(o.contact_email)
  )
group by lower(o.contact_email);

-- Link every still-unlinked order to its customer (matched on email).
update orders o
set customer_id = c.id
from customers c
where o.customer_id is null
  and lower(o.contact_email) = lower(c.email);

-- ---------------------------------------------------------------------------
-- Backfill: seed one default saved address per customer from their orders
-- ---------------------------------------------------------------------------
-- Gives the admin "Saved addresses" panel data derived from the customer's own
-- most recent shipping snapshot. Only runs for customers with no address yet.
insert into addresses (customer_id, line1, line2, landmark, city, state, pincode, country, is_default)
select distinct on (o.customer_id)
  o.customer_id,
  o.ship_line1,
  o.ship_line2,
  o.ship_landmark,
  o.ship_city,
  o.ship_state,
  o.ship_pincode,
  o.ship_country,
  true
from orders o
where o.customer_id is not null
  and not exists (
    select 1 from addresses a where a.customer_id = o.customer_id
  )
order by o.customer_id, o.created_at desc;
