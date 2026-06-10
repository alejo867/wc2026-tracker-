-- ============================================================
-- WC2026 Seattle Tracker — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Project: wc2026-tracker
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────────
-- Auto-created when a user signs in via Google OAuth
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-create profile on first sign-in
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── PREDICTIONS ───────────────────────────────────────────────
create table if not exists predictions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  match_id      integer not null,           -- matches WC match id (1-104)
  home_score    integer check (home_score >= 0 and home_score <= 30),
  away_score    integer check (away_score >= 0 and away_score <= 30),
  predicted_winner text,                    -- home team name, away team name, or 'Draw'
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id, match_id)
);

-- ── EVENTS (watch plans) ──────────────────────────────────────
create table if not exists events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  match_id      integer not null,
  event_type    text not null check (event_type in ('party', 'home', 'skip')),
  notes         text,                       -- optional watch party notes
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id, match_id)
);

-- ── FAVORITES (starred matches) ────────────────────────────────
create table if not exists favorites (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  match_id      integer not null,
  created_at    timestamptz default now(),
  unique (user_id, match_id)
);

-- ── SHARED PREDICTIONS (public read-only links) ───────────────
create table if not exists shared_snapshots (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  slug          text unique not null,       -- short share token
  display_name  text,                       -- e.g. "Alejo's predictions"
  predictions   jsonb,                      -- snapshot of predictions at share time
  created_at    timestamptz default now()
);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_predictions_updated_at on predictions;
create trigger set_predictions_updated_at
  before update on predictions
  for each row execute function set_updated_at();

drop trigger if exists set_events_updated_at on events;
create trigger set_events_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table profiles           enable row level security;
alter table predictions        enable row level security;
alter table events             enable row level security;
alter table favorites          enable row level security;
alter table shared_snapshots   enable row level security;

-- Profiles: users see only their own
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- Predictions: own rows only
create policy "predictions: own rows" on predictions
  for all using (auth.uid() = user_id);

-- Events: own rows only
create policy "events: own rows" on events
  for all using (auth.uid() = user_id);

-- Favorites: own rows only
create policy "favorites: own rows" on favorites
  for all using (auth.uid() = user_id);

-- Shared snapshots: owner can write, anyone can read by slug
create policy "snapshots: owner write" on shared_snapshots
  for all using (auth.uid() = user_id);

create policy "snapshots: public read" on shared_snapshots
  for select using (true);

-- ── INDEXES ───────────────────────────────────────────────────
create index if not exists idx_predictions_user  on predictions (user_id);
create index if not exists idx_predictions_match on predictions (match_id);
create index if not exists idx_events_user       on events (user_id);
create index if not exists idx_favorites_user    on favorites (user_id);
create index if not exists idx_snapshots_slug    on shared_snapshots (slug);
