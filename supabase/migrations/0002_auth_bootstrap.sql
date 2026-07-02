-- Vitality Base Model — auth bootstrap.
--
-- Run this AFTER 0001_base_schema.sql.
--
-- The full Vitality app fills user_profile during a 7-field onboarding flow.
-- The base model ships without that flow, so:
--   1. the demographic columns become optional (a bare profile is valid), and
--   2. a trigger creates a minimal user_profile row the moment a user signs up,
--      so the dashboard greeting, unit handling, and the workout logger all work
--      on first login with zero onboarding. Users can fill the rest later.
--
-- This is the piece the real app created by hand in the Supabase dashboard and
-- never captured as SQL — which is exactly why a naive fork wouldn't boot.

-- 1. Make the onboarding-only demographics optional.
alter table public.user_profile alter column birthday           drop not null;
alter table public.user_profile alter column sex                drop not null;
alter table public.user_profile alter column height_cm          drop not null;
alter table public.user_profile alter column starting_weight_kg drop not null;
alter table public.user_profile alter column goal               drop not null;

-- 2. Seed a minimal profile on signup.
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
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
      initcap(split_part(new.email, '@', 1))
    ),
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
