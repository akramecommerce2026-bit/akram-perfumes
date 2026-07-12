-- =============================================================================
-- Akram Perfumes — Production Checkout / Orders
-- =============================================================================
-- Moves order creation from the in-memory mock to a real, transactional
-- Supabase pipeline:
--   • billing snapshot + idempotency columns on orders
--   • place_order()          — one transaction: upsert customer, insert order +
--                              items, atomically decrement variant stock (race-
--                              safe, no negative stock), log "Order Placed"
--   • confirm_order_payment() — idempotently mark paid + advance status + log
--                              "Payment Confirmed" (+ the shipment trigger logs
--                              "Confirmed")
-- Integrity guards: unique idempotency_key (no duplicate orders), unique
-- razorpay_payment_id (no duplicate payments), NOT EXISTS guards (no duplicate
-- tracking events).
--
-- Fully idempotent + safe to re-run.
-- =============================================================================

-- Orders: billing snapshot + idempotency ------------------------------------
alter table orders
  add column if not exists bill_name                text,
  add column if not exists bill_line1               text,
  add column if not exists bill_line2               text,
  add column if not exists bill_landmark            text,
  add column if not exists bill_city                text,
  add column if not exists bill_state               text,
  add column if not exists bill_pincode             text,
  add column if not exists bill_country             text,
  add column if not exists billing_same_as_shipping boolean not null default true,
  add column if not exists idempotency_key          text;

create unique index if not exists orders_idempotency_key_key
  on orders (idempotency_key) where idempotency_key is not null;

create unique index if not exists orders_razorpay_payment_id_key
  on orders (razorpay_payment_id) where razorpay_payment_id is not null;

-- ---------------------------------------------------------------------------
-- place_order(payload jsonb) -> jsonb  { order_id, order_number, reused }
-- ---------------------------------------------------------------------------
-- Runs as one transaction (a function is atomic): if any step fails — most
-- importantly an out-of-stock variant — everything rolls back, so an order is
-- never created with an inventory it couldn't reserve. Stock is decremented with
-- `UPDATE ... WHERE stock >= qty`, which takes a row lock and both prevents
-- negative stock and serializes concurrent buyers (race-safe).
create or replace function place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_idem        text := nullif(payload->>'idempotency_key', '');
  v_email       text := lower(payload->'contact'->>'email');
  v_profile     uuid := nullif(payload->>'profile_id', '')::uuid;
  v_customer_id uuid;
  v_order_id    uuid;
  v_order_number text;
  v_item        jsonb;
  v_existing    orders%rowtype;
  v_rows        integer;
begin
  -- Idempotency: a repeated submit with the same key returns the first order.
  if v_idem is not null then
    select * into v_existing from orders where idempotency_key = v_idem limit 1;
    if found then
      return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number, 'reused', true);
    end if;
  end if;

  -- Upsert the customer by email (link the auth profile when signed in).
  select id into v_customer_id from customers where lower(email) = v_email limit 1;
  if v_customer_id is null then
    insert into customers (email, full_name, phone, profile_id)
    values (payload->'contact'->>'email', payload->'contact'->>'name', payload->'contact'->>'phone', v_profile)
    returning id into v_customer_id;
  elsif v_profile is not null then
    update customers set profile_id = coalesce(profile_id, v_profile) where id = v_customer_id;
  end if;

  -- Unique, human-readable order number.
  loop
    v_order_number := 'AKR-' || upper(substr(md5(random()::text), 1, 6)) || '-' || upper(substr(md5(random()::text), 1, 3));
    exit when not exists (select 1 from orders where order_number = v_order_number);
  end loop;

  insert into orders (
    order_number, customer_id, idempotency_key,
    contact_name, contact_email, contact_phone,
    ship_line1, ship_line2, ship_landmark, ship_city, ship_state, ship_pincode, ship_country,
    bill_name, bill_line1, bill_line2, bill_landmark, bill_city, bill_state, bill_pincode, bill_country, billing_same_as_shipping,
    delivery_method, subtotal, shipping, tax, discount, total, currency,
    status, payment_status, payment_method, shipment_status
  ) values (
    v_order_number, v_customer_id, v_idem,
    payload->'contact'->>'name', payload->'contact'->>'email', payload->'contact'->>'phone',
    payload->'shipping'->>'line1', nullif(payload->'shipping'->>'line2',''), nullif(payload->'shipping'->>'landmark',''),
    payload->'shipping'->>'city', payload->'shipping'->>'state', payload->'shipping'->>'pincode', coalesce(payload->'shipping'->>'country','India'),
    nullif(payload->'billing'->>'name',''), nullif(payload->'billing'->>'line1',''), nullif(payload->'billing'->>'line2',''), nullif(payload->'billing'->>'landmark',''),
    nullif(payload->'billing'->>'city',''), nullif(payload->'billing'->>'state',''), nullif(payload->'billing'->>'pincode',''), nullif(payload->'billing'->>'country',''),
    coalesce((payload->>'billing_same_as_shipping')::boolean, true),
    coalesce(payload->>'delivery_method','standard'),
    (payload->>'subtotal')::integer, (payload->>'shipping_fee')::integer, coalesce((payload->>'tax')::integer,0),
    coalesce((payload->>'discount')::integer,0), (payload->>'total')::integer, coalesce(payload->>'currency','INR'),
    'pending', 'pending', coalesce(payload->>'payment_method','razorpay'), 'pending'
  ) returning id into v_order_id;

  -- Items + atomic, race-safe stock decrement.
  for v_item in select value from jsonb_array_elements(payload->'items') loop
    insert into order_items (
      order_id, product_id, variant_id, product_name, product_slug, variant_name, sku, featured_image,
      unit_price, quantity, line_total, currency
    ) values (
      v_order_id, nullif(v_item->>'product_id',''), nullif(v_item->>'variant_id',''),
      v_item->>'product_name', coalesce(v_item->>'product_slug',''), v_item->>'variant_name', v_item->>'sku',
      coalesce(v_item->>'featured_image',''), (v_item->>'unit_price')::integer, (v_item->>'quantity')::integer,
      (v_item->>'line_total')::integer, coalesce(v_item->>'currency','INR')
    );

    if nullif(v_item->>'variant_id','') is not null then
      update product_variants
        set stock = stock - (v_item->>'quantity')::integer
        where id = v_item->>'variant_id' and stock >= (v_item->>'quantity')::integer;
      get diagnostics v_rows = row_count;
      if v_rows = 0 then
        raise exception 'INSUFFICIENT_STOCK:%', coalesce(v_item->>'sku', v_item->>'variant_id')
          using errcode = 'P0001';
      end if;
    end if;
  end loop;

  insert into order_tracking_events (order_id, status, message) values (v_order_id, null, 'Order Placed');

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'reused', false);
end;
$$;

-- ---------------------------------------------------------------------------
-- confirm_order_payment() — idempotent paid transition
-- ---------------------------------------------------------------------------
create or replace function confirm_order_payment(
  p_order_id uuid,
  p_payment_id text,
  p_signature text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = 'P0002';
  end if;

  if v_order.payment_status = 'paid' then
    return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'already_paid', true);
  end if;

  update orders set
    payment_status    = 'paid',
    payment_timestamp = now(),
    razorpay_payment_id = coalesce(p_payment_id, razorpay_payment_id),
    razorpay_signature  = coalesce(p_signature, razorpay_signature),
    status          = case when status = 'pending' then 'confirmed' else status end,
    shipment_status = case when shipment_status = 'pending' then 'confirmed' else shipment_status end
  where id = p_order_id;

  -- The orders_log_shipment_status trigger logs "Confirmed" for the shipment
  -- change; log the payment milestone here (guarded so it can't duplicate).
  insert into order_tracking_events (order_id, status, message)
  select p_order_id, null, 'Payment Confirmed'
  where not exists (
    select 1 from order_tracking_events where order_id = p_order_id and message = 'Payment Confirmed'
  );

  return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'already_paid', false);
end;
$$;

-- Callable by the service role (server actions run with it); not by anon.
revoke all on function place_order(jsonb) from anon, authenticated;
revoke all on function confirm_order_payment(uuid, text, text) from anon, authenticated;
grant execute on function place_order(jsonb) to service_role;
grant execute on function confirm_order_payment(uuid, text, text) to service_role;
