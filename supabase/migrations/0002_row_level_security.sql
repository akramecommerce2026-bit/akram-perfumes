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
