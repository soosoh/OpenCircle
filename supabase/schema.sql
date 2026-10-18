-- StudyCircle schema for Supabase (Postgres).
--
-- Each entity is stored as one JSON document with a separate text primary key.
-- This keeps the app's table contract (lib/database/store.ts) tiny and lets the whole
-- domain model live in TypeScript (types/index.ts).
--
-- Apply with: supabase db execute --file supabase/schema.sql
-- or paste into the SQL editor in the Supabase dashboard.

create table if not exists users (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists chords (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists points (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists goals (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists messages (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists help_requests (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

create table if not exists private_messages (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

-- The service role key bypasses RLS, so these policies only matter if you later
-- add a client-side (anon key) path. They deny direct client access by default.
alter table users            enable row level security;
alter table chords           enable row level security;
alter table points           enable row level security;
alter table goals            enable row level security;
alter table messages         enable row level security;
alter table help_requests    enable row level security;
alter table private_messages enable row level security;

-- NOTE: this schema stores no seed rows. Seed demo data lives in
-- lib/database/seed.ts and is used by the in-memory backend only.
