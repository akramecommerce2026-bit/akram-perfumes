-- =============================================================================
-- Akram Perfumes — Auth: profile provisioning
-- =============================================================================
-- `profiles` is 1:1 with auth.users, but nothing ever inserted into it: sign-up
-- created the auth user and stopped there. Two consequences, both fixed here:
--
--   1. A registered customer had no profile row.
--   2. `customers.profile_id` references profiles(id), and `place_order` passes
--      the signed-in user's id — so a logged-in customer's checkout failed with
--      23503 (foreign key violation) and the whole order rolled back. Only guest
--      orders (profile_id null) ever worked.
--
-- The trigger runs as the definer so it can write regardless of the RLS policies
-- on profiles, and is idempotent (on conflict do nothing) so a retried sign-up
-- can never fail with "Database error saving new user".
--
-- Fully idempotent + safe to re-run.
-- =============================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill every existing auth user (the admin, and anyone who registered before
-- the trigger existed) so no account is left without a profile.
insert into public.profiles (id, full_name)
select
  u.id,
  nullif(trim(coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    ''
  )), '')
from auth.users u
on conflict (id) do nothing;
