-- Vitality Base Model — consolidated schema (assembled from the tested Vitality migrations).
-- Run this once in your Supabase SQL editor (or via the CLI) against a fresh project,
-- then run 0002_auth_bootstrap.sql. Every table is RLS-scoped to auth.uid().


-- ============================================================
-- source: 20260512000001_build02_schema
-- ============================================================
-- BUILD02: v1 data model
-- Run this in the Supabase SQL editor for project hxhnjjcemmcqneogmbpm.
-- DO NOT run via CLI without reviewing first.

-- ============================================================
-- user_profile
-- ============================================================
create table public.user_profile (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  first_name         text not null,
  birthday           date not null,
  sex                text not null check (sex in ('M', 'F')),
  height_cm          numeric(5, 2) not null,
  starting_weight_kg numeric(5, 2) not null,
  units              text not null default 'metric' check (units in ('metric', 'imperial')),
  goal               text not null check (goal in ('recomp', 'cut', 'bulk', 'maintain', 'general_health')),
  onboarding_step    int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.user_profile enable row level security;

create policy "users can read own profile"
  on public.user_profile for select
  using (auth.uid() = user_id);

create policy "users can insert own profile"
  on public.user_profile for insert
  with check (auth.uid() = user_id);

create policy "users can update own profile"
  on public.user_profile for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own profile"
  on public.user_profile for delete
  using (auth.uid() = user_id);

-- ============================================================
-- weights
-- ============================================================
create table public.weights (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  weight_kg  numeric(5, 2) not null,
  note       text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.weights enable row level security;

create policy "users can read own weights"
  on public.weights for select
  using (auth.uid() = user_id);

create policy "users can insert own weights"
  on public.weights for insert
  with check (auth.uid() = user_id);

create policy "users can update own weights"
  on public.weights for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own weights"
  on public.weights for delete
  using (auth.uid() = user_id);

-- ============================================================
-- water_log
-- (multiple entries per day allowed — no unique constraint)
-- ============================================================
create table public.water_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  amount_ml  int not null check (amount_ml > 0),
  logged_at  timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index water_log_user_date_idx on public.water_log (user_id, date);

alter table public.water_log enable row level security;

create policy "users can read own water log"
  on public.water_log for select
  using (auth.uid() = user_id);

create policy "users can insert own water log"
  on public.water_log for insert
  with check (auth.uid() = user_id);

create policy "users can update own water log"
  on public.water_log for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own water log"
  on public.water_log for delete
  using (auth.uid() = user_id);

-- ============================================================
-- supplements_stack
-- ============================================================
create table public.supplements_stack (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  supplement_name  text not null,
  dose             text,
  timing           text,
  with_food        boolean,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.supplements_stack enable row level security;

create policy "users can read own supplements stack"
  on public.supplements_stack for select
  using (auth.uid() = user_id);

create policy "users can insert own supplements stack"
  on public.supplements_stack for insert
  with check (auth.uid() = user_id);

create policy "users can update own supplements stack"
  on public.supplements_stack for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own supplements stack"
  on public.supplements_stack for delete
  using (auth.uid() = user_id);

-- ============================================================
-- wearable_connections
-- ============================================================
create table public.wearable_connections (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  provider                 text not null check (provider in ('whoop')),
  provider_user_id         text not null,
  encrypted_refresh_token  text not null,
  encrypted_access_token   text not null,
  access_token_expires_at  timestamptz not null,
  connected_at             timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.wearable_connections enable row level security;

create policy "users can read own wearable connections"
  on public.wearable_connections for select
  using (auth.uid() = user_id);

create policy "users can insert own wearable connections"
  on public.wearable_connections for insert
  with check (auth.uid() = user_id);

create policy "users can update own wearable connections"
  on public.wearable_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own wearable connections"
  on public.wearable_connections for delete
  using (auth.uid() = user_id);

-- ============================================================
-- wearable_data
-- ============================================================
create table public.wearable_data (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  provider    text not null,
  hrv         numeric(5, 2),
  rhr         int,
  sleep_perf  numeric(5, 2),
  sleep_hours numeric(4, 2),
  recovery    int,
  strain      numeric(4, 2),
  raw         jsonb,
  created_at  timestamptz not null default now(),
  unique (user_id, date, provider)
);

create index wearable_data_user_date_idx on public.wearable_data (user_id, date);

alter table public.wearable_data enable row level security;

create policy "users can read own wearable data"
  on public.wearable_data for select
  using (auth.uid() = user_id);

create policy "users can insert own wearable data"
  on public.wearable_data for insert
  with check (auth.uid() = user_id);

create policy "users can update own wearable data"
  on public.wearable_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own wearable data"
  on public.wearable_data for delete
  using (auth.uid() = user_id);

-- ============================================================
-- training_settings
-- ============================================================
create table public.training_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  split_type    text not null check (split_type in ('3_day', '4_day', '5_day', '6_day', 'custom')),
  rotation_days jsonb not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.training_settings enable row level security;

create policy "users can read own training settings"
  on public.training_settings for select
  using (auth.uid() = user_id);

create policy "users can insert own training settings"
  on public.training_settings for insert
  with check (auth.uid() = user_id);

create policy "users can update own training settings"
  on public.training_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own training settings"
  on public.training_settings for delete
  using (auth.uid() = user_id);

-- ============================================================
-- workouts
-- ============================================================
create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         date not null,
  day_name     text not null,
  exercises    jsonb not null,
  submitted_at timestamptz,
  created_at   timestamptz not null default now()
);

create index workouts_user_date_idx on public.workouts (user_id, date);

alter table public.workouts enable row level security;

create policy "users can read own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "users can insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "users can update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Grants
-- Raw SQL CREATE TABLE does not auto-grant the way Supabase
-- dashboard does. Must be explicit for RLS to function.
-- ============================================================
grant select, insert, update, delete on table public.user_profile        to anon, authenticated, service_role;
grant select, insert, update, delete on table public.weights              to anon, authenticated, service_role;
grant select, insert, update, delete on table public.water_log            to anon, authenticated, service_role;
grant select, insert, update, delete on table public.supplements_stack    to anon, authenticated, service_role;
grant select, insert, update, delete on table public.wearable_connections to anon, authenticated, service_role;
grant select, insert, update, delete on table public.wearable_data        to anon, authenticated, service_role;
grant select, insert, update, delete on table public.training_settings    to anon, authenticated, service_role;
grant select, insert, update, delete on table public.workouts             to anon, authenticated, service_role;


-- ============================================================
-- source: 20260512000002_build02_grants
-- ============================================================
-- PATCH04: Grant table-level permissions for BUILD02 tables.
--
-- Root cause: raw SQL CREATE TABLE does not auto-grant anon/authenticated/service_role
-- the way Supabase dashboard does. RLS policies are irrelevant until the role has the
-- basic table privilege — the DB rejects with "permission denied for table X" before
-- even evaluating policies.
--
-- Run this in the Supabase SQL editor for project hxhnjjcemmcqneogmbpm.

grant select, insert, update, delete on table public.user_profile      to anon, authenticated, service_role;
grant select, insert, update, delete on table public.weights            to anon, authenticated, service_role;
grant select, insert, update, delete on table public.water_log          to anon, authenticated, service_role;
grant select, insert, update, delete on table public.supplements_stack  to anon, authenticated, service_role;
grant select, insert, update, delete on table public.wearable_connections to anon, authenticated, service_role;
grant select, insert, update, delete on table public.wearable_data      to anon, authenticated, service_role;
grant select, insert, update, delete on table public.training_settings  to anon, authenticated, service_role;
grant select, insert, update, delete on table public.workouts           to anon, authenticated, service_role;


-- ============================================================
-- source: 20260520000001_build08_training_setup
-- ============================================================
-- ============================================================
-- BUILD08 — Training setup (fitness module onboarding)
-- ============================================================
-- Extend training_settings with the fitness module's setup data:
--   gym_level         — beginner / intermediate / advanced
--   recommended_weights — jsonb { exerciseId: weight_kg }
--   setup_complete    — boolean gating flag
--
-- The user fills these via the /app/fitness/setup wizard. Until
-- setup_complete = true, /app/fitness/log redirects there. The
-- TAILOR_TABLE computation runs server-side in a server action
-- and writes the resulting recommended_weights blob here.
--
-- ⚠️  APPLY MANUALLY in the Supabase SQL editor for project
--    hxhnjjcemmcqneogmbpm. The migration is idempotent (`if not
--    exists`) so re-running is safe.
-- ============================================================

alter table public.training_settings
  add column if not exists gym_level text
    check (gym_level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists recommended_weights jsonb not null default '{}'::jsonb,
  add column if not exists setup_complete boolean not null default false;

create index if not exists training_settings_setup_complete_idx
  on public.training_settings (user_id, setup_complete);

-- Grant statements aren't needed for new columns on an existing table —
-- the original GRANTs on the table cover all columns, including new ones.


-- ============================================================
-- source: 20260524000001_build10_workouts_unique
-- ============================================================
-- BUILD10 — workouts uniqueness for upsert
--
-- The workouts table (BUILD02) was created without a unique constraint
-- on (user_id, date, day_name). SplitLog wires continuous auto-save via
-- upsert(onConflict: 'user_id,date,day_name') — that needs a unique
-- index to dispatch the conflict resolution.
--
-- Behavioural decision: one workout row per (user, date, day_name).
-- A user can still log multiple sessions on the same date by visiting
-- different days from the rotation (Push then Pull on Monday); each
-- has a distinct day_name. The rare "I did Push twice on Monday"
-- case overwrites — acceptable.

-- Wrapped in a DO block so re-running this migration on a database that
-- already has the constraint is a no-op rather than an error. PostgreSQL
-- doesn't support `add constraint ... if not exists` natively.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workouts_user_date_day_unique'
      and conrelid = 'public.workouts'::regclass
  ) then
    alter table public.workouts
      add constraint workouts_user_date_day_unique
      unique (user_id, date, day_name);
  end if;
end $$;


-- ============================================================
-- source: 20260525000004_build18_training_intake
-- ============================================================
-- BUILD17 — Persist the tailored-intake answers + computed recommendation
-- on training_settings so the diagnostic card and the "Completed" badge
-- on the setup wizard's launcher survive page refresh / new device.
--
-- Both columns are nullable jsonb. Existing rows pre-BUILD17 simply have
-- nulls — the wizard treats null as "intake not taken yet" and renders
-- the empty-state launcher.
--
-- intake_answers — raw IntakeAnswers from IntakeQuiz (the 11 selections)
-- intake_rec     — computed IntakeRecommendation (preset id, name,
--                  diagnostic line, reasoning bullets, alternatives)

alter table public.training_settings
  add column if not exists intake_answers jsonb,
  add column if not exists intake_rec     jsonb;

-- No new RLS policy needed — existing per-user policies already cover
-- all columns of the row.


-- ============================================================
-- source: 20260604000001_lift_rest_overrides
-- ============================================================
-- ============================================================
-- Per-lift rest-timer overrides.
--
-- rest_overrides — jsonb { `${exerciseId}__${dayType}`: seconds }
--
-- Mirrors the recommended_weights model: keyed by exercise id + day type, so a
-- saved rest time FOLLOWS the exercise across splits (re-running setup keeps
-- it) and HEAVY vs VOLUME keep their own values. The Tune sheet
-- (ExerciseSettings) reads/writes it; SplitLog's rest timer prefers it over the
-- tier×day-type default in REST_SEC. Empty default = fall back to REST_SEC.
--
-- Additive + idempotent. No backfill needed — absent keys fall back to the
-- computed default, so existing users are unaffected.
-- ============================================================

alter table public.training_settings
  add column if not exists rest_overrides jsonb not null default '{}'::jsonb;


-- ============================================================
-- source: 20260606000001_custom_exercises
-- ============================================================
-- ============================================================
-- Per-user custom exercises.
--
-- custom_exercises — jsonb [ { "id": "custom_<uuid>", "name": "Barbell pause reps" } ]
--
-- When a lift isn't in the static EX library, the user can add their own from
-- the "Add a lift" sheet. The definition is saved here (per user, RLS-scoped via
-- the existing training_settings row) so it's reusable across days: it shows up
-- in the add-picker search every session, and — because workout history is keyed
-- by exercise id — a stable custom id accumulates history week to week just like
-- a built-in lift. Name only for now (the picker is search-driven, no muscle
-- needed); a muscle field can be added later without a migration (additive JSON).
--
-- Additive + idempotent. No backfill — absent column / empty array means the
-- user simply has no custom lifts yet, so existing accounts are unaffected.
-- ============================================================

alter table public.training_settings
  add column if not exists custom_exercises jsonb not null default '[]'::jsonb;


-- ============================================================
-- source: 20260610000001_workouts_cardio
-- ============================================================
-- Optional end-of-session cardio, stored on the workouts row.
--
-- One JSONB array of cardio bouts per logged session, e.g.
--   [{ "type": "walk", "label": "Walk", "durationMin": 30, "zone2Min": 25 }]
--
-- Nullable so existing rows and lift-only sessions are unaffected. RLS on
-- public.workouts already scopes reads/writes to auth.uid(); a new column on
-- the same row needs no extra policy.

alter table public.workouts
  add column if not exists cardio jsonb;


-- ============================================================
-- source: 20260616000001_workouts_off_day
-- ============================================================
-- Off-day / readiness marker on a logged session.
--
-- When the user trains on a low-readiness day (tired, sick, drained), they pick
-- a level in the logger's readiness sheet. We ease the day's load AND keep that
-- session off the progress graph so an off day never dents their baseline.
--
-- Stored as a short text level on the workouts row:
--   'little' = a little off (light back-off)
--   'rough'  = pretty rough (sick / drained but still showing up)
--   null     = a normal session
--
-- Nullable so existing rows and normal sessions are unaffected. RLS on
-- public.workouts already scopes reads/writes to auth.uid(); a new column on
-- the same row needs no extra policy.

alter table public.workouts
  add column if not exists off_day text;


-- ============================================================
-- source: 20260618000002_training_settings_deload
-- ============================================================
-- Deload week marker on the user's training settings.
--
-- A deload is a planned light week applied across ONE pass through the split:
-- each training day gets one eased session (volume cut ~half, ~10% lighter,
-- stop short of failure), then it's "spent" and the next block resumes at the
-- real baseline. We track only the START date here; which days are still owed
-- an easy session is derived from the workouts rows stamped off_day = 'deload'
-- on or after this date (see getDeloadedDayNamesSince). A safety window in the
-- app treats a stale start (more than ~3 weeks old) as finished.
--
-- Nullable, defaults to null = not deloading. RLS on public.training_settings
-- already scopes reads/writes to auth.uid(); a new column needs no new policy.

alter table public.training_settings
  add column if not exists deload_started_on date;


-- ============================================================
-- source: 20260618000003_training_settings_cycle_start
-- ============================================================
-- "Start a new week" marker on the user's training settings.
--
-- Tapping "Start a new week" wipes the schedule board back to a clean slate
-- WITHOUT touching a single logged workout row. We record only the MOMENT the
-- user reset; the schedule then shows a day as "completed" only if its session
-- was finished AFTER this timestamp (see app/app/fitness/log/page.tsx). So the
-- board clears instantly (even a session finished earlier the same day) and
-- lights back up as the user trains the new week. History, graphs and PRs are
-- never altered — this is a read-time filter, not a data mutation. The action
-- is fully reversible: Undo just restores the previous value of this column.
--
-- Nullable, default null = never reset. RLS on public.training_settings already
-- scopes reads/writes to auth.uid(); a new column needs no new policy.

alter table public.training_settings
  add column if not exists cycle_started_at timestamptz;


-- ============================================================
-- source: 20260628000001_tile_report_streams
-- ============================================================
-- ===========================================================================
-- tile_streams + tile_reports — the tile-to-Vee report contract, in the database
-- ===========================================================================
-- A sealed tile feeds Vee one numeric life-stream via Vitality.report({ key,
-- label, value, date, kind, goalDirection }). Two tables hold it, both RLS-scoped
-- so one user's tile can never read or write another's stream:
--   tile_streams  = the IDENTITY of a stream (one row per user+key). canonical_key
--                   normalizes families (beer/brews/pints -> alcohol) so the
--                   noticed engine can carry cross-user priors. kind is the fixed
--                   ~7-member taxonomy that tells the generic engine how to treat
--                   a number it has never seen (see lib/tiles/reportContract.ts).
--   tile_reports  = one logged datapoint (user+stream_key+date is unique, so
--                   re-logging a day upserts instead of duplicating).
-- Written by the reportStream server action (app/app/create/reportActions.ts via
-- lib/tiles/reportWrites.ts). Read by the noticed engine through
-- lib/tiles/tileInsight.ts (reportsToSeries -> alignByBucket -> detectSeam).

create table if not exists public.tile_streams (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  -- raw key as the tile reported it, e.g. 'beer'. Unique per user.
  key            text not null,
  -- normalized family for cross-user priors, e.g. 'alcohol'. Defaults to key.
  canonical_key  text not null,
  label          text not null,
  -- the fixed taxonomy. Loosely typed via a check so the DB and the TS enum agree.
  kind           text not null check (kind in
                   ('intake', 'count', 'duration', 'rating', 'measure', 'money', 'done')),
  -- what "good" looks like, so downstream copy reads right. null = unspecified.
  goal_direction text check (goal_direction in ('up', 'down', 'neutral')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, key)
);

create table if not exists public.tile_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- links to tile_streams.key for the same user (one value per stream per day).
  stream_key  text not null,
  value       numeric not null,
  date        date not null,
  created_at  timestamptz not null default now(),
  unique (user_id, stream_key, date)
);

create index if not exists tile_reports_user_stream_idx
  on public.tile_reports (user_id, stream_key, date);

alter table public.tile_streams enable row level security;
alter table public.tile_reports enable row level security;

create policy "users can read own tile streams"
  on public.tile_streams for select using (auth.uid() = user_id);
create policy "users can insert own tile streams"
  on public.tile_streams for insert with check (auth.uid() = user_id);
create policy "users can update own tile streams"
  on public.tile_streams for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users can delete own tile streams"
  on public.tile_streams for delete using (auth.uid() = user_id);

create policy "users can read own tile reports"
  on public.tile_reports for select using (auth.uid() = user_id);
create policy "users can insert own tile reports"
  on public.tile_reports for insert with check (auth.uid() = user_id);
create policy "users can update own tile reports"
  on public.tile_reports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users can delete own tile reports"
  on public.tile_reports for delete using (auth.uid() = user_id);

grant select, insert, update, delete on table public.tile_streams to anon, authenticated, service_role;
grant select, insert, update, delete on table public.tile_reports to anon, authenticated, service_role;


-- ============================================================
-- source: 20260630000001_creator_profiles
-- ============================================================
-- Arts District v2 — IDENTITY (the keystone of the creator flywheel).
--
-- A public maker identity: a one-way-door @username + the maker's "one link"
-- + a short bio, rendered at the public /u/<username> page and used as the
-- byline that credits published tiles (v3).
--
-- WHY A SEPARATE TABLE (not new columns on `profiles`):
-- RLS is row-level, not column-level. The design spec said "add username to
-- profiles, public-read by handle" — but `profiles` also holds billing state
-- (tier, stripe_customer_id, subscription_status, current_period_end) and the
-- onboarding flag. A public-read policy on `profiles` would expose ALL of
-- those columns to anonymous visitors of a profile page. That violates the
-- multi-user hard rule. `creator_profiles` holds ONLY public fields, so a
-- blanket public-read policy is safe by construction and can never leak a
-- billing column added later. Same product intent, RLS-safe realization.
--
-- Keyed by user_id = auth.users.id = profiles.id, so v3's
-- published_tiles.creator_id can reference either and the byline joins here.

create extension if not exists citext;

create table public.creator_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  -- citext = case-insensitive; the unique index makes @LukeWise and @lukewise
  -- the same handle. Stored already-normalized (lowercased) by the app.
  username      citext not null unique
                  check (
                    length(username::text) between 3 and 20
                    and username::text ~ '^[a-z0-9_]+$'
                  ),
  display_name  text check (display_name is null or length(display_name) <= 50),
  bio           text check (bio is null or length(bio) <= 240),
  -- the maker's "one link" (their YouTube / site) — the fuel of the flywheel
  link_url      text check (link_url is null or length(link_url) <= 400),
  instagram_url text check (instagram_url is null or length(instagram_url) <= 400),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Case-insensitive lookup index for /u/<username> (citext already folds case,
-- the unique constraint above provides the index; this is just explicit intent
-- documentation — the unique index serves the lookup).

alter table public.creator_profiles enable row level security;

-- PUBLIC read: anyone (signed-in or anon) can read any maker's public profile.
-- Safe because every column here is intentionally public.
create policy "anyone can read creator profiles"
  on public.creator_profiles for select
  using (true);

-- Self-write only: a user can create / edit / delete only their own row.
create policy "users can insert own creator profile"
  on public.creator_profiles for insert
  with check (auth.uid() = user_id);

create policy "users can update own creator profile"
  on public.creator_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own creator profile"
  on public.creator_profiles for delete
  using (auth.uid() = user_id);

-- Keep updated_at honest.
create or replace function public.touch_creator_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger creator_profiles_touch_updated_at
  before update on public.creator_profiles
  for each row execute function public.touch_creator_profiles_updated_at();

-- Grants. Raw SQL CREATE TABLE does not auto-grant the way the Supabase
-- dashboard does — must be explicit for RLS to function. anon gets SELECT
-- only (public read); authenticated gets full CRUD (gated to own row by RLS).
grant select on table public.creator_profiles to anon;
grant select, insert, update, delete on table public.creator_profiles to authenticated, service_role;


-- ============================================================
-- source: 20260630000002_published_tiles
-- ============================================================
-- Arts District v3 — PUBLISH + credit (the spine).
--
-- A maker publishes a tile: a server-side snapshot of the sealed tile, credited
-- to their handle (creator_profiles), free for anyone to add via the LOCKED
-- importTile socket. Personal tiles stay in localStorage; only a PUBLISHED tile
-- lives here.
--
-- NOT YET APPLIED to prod. Apply (after review) the v2-proven safe way:
--   supabase db query --linked -f supabase/migrations/20260630000002_published_tiles.sql
-- (NOT `db push` — prod has migration-history drift.)
--
-- Moderation is curated-at-launch (locked decision): a new row is 'pending';
-- the public shop shows only 'approved'; the maker always sees their own (any
-- status) on their /u page. Luke/Liam flip status to 'approved'. A creator can
-- never self-approve (enforced by the trigger below).

create table public.published_tiles (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references auth.users(id) on delete cascade,
  name          text not null check (length(name) between 1 and 80),
  html          text not null,                 -- the sealed tile snapshot (TileEnvelope.html)
  envelope      jsonb not null,                -- full TileEnvelope for a pure importTile(envelope)
  category      text check (category is null or length(category) <= 40),
  opt_in_reuse  boolean not null default true,
  install_count integer not null default 0,    -- exists now; incremented server-side in v4
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index published_tiles_creator_idx on public.published_tiles (creator_id, created_at desc);
create index published_tiles_approved_idx on public.published_tiles (status, created_at desc)
  where status = 'approved';

alter table public.published_tiles enable row level security;

-- PUBLIC read of APPROVED tiles only (the shop). anon + authenticated.
create policy "anyone can read approved tiles"
  on public.published_tiles for select
  using (status = 'approved');

-- A creator can always read their OWN tiles (any status) — for the /u page + manage.
create policy "creators read own tiles"
  on public.published_tiles for select
  using (auth.uid() = creator_id);

-- Self-write. A creator may only ever INSERT a 'pending' row (no self-publish).
create policy "creators insert own pending tiles"
  on public.published_tiles for insert
  with check (auth.uid() = creator_id and status = 'pending');

create policy "creators update own tiles"
  on public.published_tiles for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

create policy "creators delete own tiles"
  on public.published_tiles for delete
  using (auth.uid() = creator_id);

-- Guard the moderation gate: a non-service_role caller can never move `status`
-- to 'approved' (so the UPDATE policy above can't be used to self-approve).
-- service_role (the admin flip) bypasses RLS + this check via the role test.
create or replace function public.guard_published_tiles_status()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status is distinct from old.status
     and new.status = 'approved'
     and current_setting('role', true) is distinct from 'service_role'
     and auth.uid() is not null then
    raise exception 'cannot self-approve a published tile';
  end if;
  return new;
end;
$$;

create trigger published_tiles_guard_status
  before update on public.published_tiles
  for each row execute function public.guard_published_tiles_status();

-- Grants. anon read-only (RLS still restricts to approved); authenticated full
-- CRUD (RLS scopes to own rows); service_role for the admin approval flip.
grant select on table public.published_tiles to anon;
grant select, insert, update, delete on table public.published_tiles to authenticated, service_role;


-- ============================================================
-- source: 20260630000003_tiles_registry
-- ============================================================
-- Personal tile registry (the build -> dashboard loop keystone).
--
-- Replaces the localStorage v1 in lib/tiles/tileStore.ts with a server-side
-- table so a tile built anywhere (the MCP in Claude Code, the create page, a
-- paste) lands on the user's dashboard on any device. Shape agreed with the
-- MCP window in mcp/docs/tiles-table-contract.md so both sides build to one
-- target and a single prod migration covers it.
--
-- Runtime data a tile persists via Vitality.save() lives in a SEPARATE row
-- (tile_data) so a growing payload never rewrites the html — exactly how
-- tileStore splits index vs data today.
--
-- RLS: a user only ever sees their own tiles. auth.uid() covers the dashboard
-- + the MCP's user-session mode; the MCP's service-role mode stamps user_id by
-- hand (RLS bypassed there), so writes still scope correctly.

create table if not exists public.tiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  html        text not null,                 -- the sealed tile source (iframe srcDoc)
  stream      jsonb,                          -- {key,label,kind,goalDirection} or null
  category    text,                           -- fitness|health|finance|mind|data
  color       text,                           -- hex accent (#RGB or #RRGGBB)
  source      text not null default 'mcp',    -- 'mcp' | 'paste' | 'hub'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tiles enable row level security;

create policy "tiles owner rw" on public.tiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tiles_user_idx on public.tiles(user_id, updated_at desc);

-- Runtime data a tile persists via Vitality.save(), kept separate from the html.
create table if not exists public.tile_data (
  user_id    uuid not null references auth.users(id) on delete cascade,
  tile_id    uuid not null references public.tiles(id) on delete cascade,
  data       jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, tile_id)
);

alter table public.tile_data enable row level security;

create policy "tile_data owner rw" on public.tile_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Grants. Raw SQL CREATE TABLE does not auto-grant; RLS still scopes every row.
grant select, insert, update, delete on table public.tiles      to authenticated, service_role;
grant select, insert, update, delete on table public.tile_data  to authenticated, service_role;


-- ============================================================
-- source: 20260702000003_tile_tombstones
-- ============================================================
-- Cross-device tile deletion tombstones (merge-gate review finding 5, 2026-07-02).
--
-- Problem: deleting a tile removes its `tiles` row, but pullAndMerge on another
-- device is add-only, so that device keeps its local copy and the deleted tile
-- lives on there. A tombstone records "this tile id was deleted" so every other
-- device prunes its local copy on the next pull.
--
-- RLS-scoped to the owner. `tile_id` is not an FK (the tiles row is already gone
-- when the tombstone is written). A tombstone is harmless to keep; a periodic
-- cleanup can prune rows older than a sync window later.
--
-- NOT YET APPLIED to prod. Apply (after review) the v2-proven safe way:
--   supabase db query --linked -f supabase/migrations/20260702000003_tile_tombstones.sql
-- (NOT `db push` — prod has migration-history drift.)

create table if not exists public.deleted_tiles (
  user_id    uuid not null references auth.users(id) on delete cascade,
  tile_id    uuid not null,
  deleted_at timestamptz not null default now(),
  primary key (user_id, tile_id)
);

alter table public.deleted_tiles enable row level security;

create policy "deleted_tiles owner rw" on public.deleted_tiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists deleted_tiles_user_idx on public.deleted_tiles(user_id, deleted_at desc);

grant select, insert, update, delete on table public.deleted_tiles to authenticated, service_role;

