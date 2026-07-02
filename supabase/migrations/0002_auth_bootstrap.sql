-- Vitality Base Model — auth bootstrap.
--
-- Run this AFTER 0001_base_schema.sql.
--
-- The base model has NO login screen: it's a personal dashboard, so every visitor
-- gets a silent ANONYMOUS session (enable it in Supabase → Authentication →
-- Sign In / Providers → "Anonymous sign-ins"). Anonymous users have no email, so:
--   1. the onboarding-only demographics become optional (a bare profile is valid),
--      and first_name is optional too (the greeting just stays generic), and
--   2. a trigger creates a minimal user_profile row the moment a session is
--      created, so the dashboard greeting, unit handling, and the workout logger
--      all work immediately.
--
-- This trigger is the piece the real app created by hand in the Supabase
-- dashboard and never captured as SQL — which is why a naive fork wouldn't boot.

-- 1. Make the onboarding-only fields optional (anonymous users supply none of them).
alter table public.user_profile alter column first_name         drop not null;
alter table public.user_profile alter column birthday           drop not null;
alter table public.user_profile alter column sex                drop not null;
alter table public.user_profile alter column height_cm          drop not null;
alter table public.user_profile alter column starting_weight_kg drop not null;
alter table public.user_profile alter column goal               drop not null;

-- 2. Seed a minimal profile whenever an auth user (incl. anonymous) is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profile (user_id, first_name, units)
  values (
    new.id,
    -- a name only if one was supplied (email/OAuth signups); anonymous → null,
    -- and the dashboard greets generically.
    nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), ''),
    'metric'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
