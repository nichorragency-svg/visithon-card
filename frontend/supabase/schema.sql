-- Run in Supabase SQL Editor after creating Storage bucket `media` (public).
-- Also set Auth → Email: disable "Confirm email" for smoothest QA, or keep it on.

create extension if not exists "pgcrypto";

-- Profiles (wizard + card ownership)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  has_card boolean not null default false,
  wizard_completed boolean not null default false,
  is_published boolean not null default false,
  profile jsonb not null default '{}'::jsonb,
  products jsonb not null default '[]'::jsonb,
  payment_methods jsonb not null default '[]'::jsonb,
  reminders jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Safe to re-run: drop policies before re-creating (avoids "already exists").
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_select_public_live" on public.profiles;

create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

create policy profiles_select_public_live
  on public.profiles for select
  using (is_published = true);

-- Themes (wizard picker)
create table if not exists public.themes (
  id uuid primary key default gen_random_uuid (),
  layout_key text not null unique,
  name text not null default '',
  category text not null default 'professional',
  preview_url text not null default '',
  is_active boolean not null default true,
  ui_tokens jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.themes enable row level security;

drop policy if exists "themes_read_active_anon" on public.themes;

create policy themes_read_active_anon
  on public.themes for select
  using (is_active = true);

-- Seed minimal themes matching frontend THEME_STYLE_BY_ID layout keys.
insert into public.themes (layout_key, name, category, preview_url, is_active)
values
  ('professional', 'Professional Sky', 'professional', '', true),
  ('elegant', 'Elegant Gold', 'professional', '', true),
  ('dark_modern', 'Dark Modern', 'modern', '', true),
  ('minimal_light', 'Minimal Light', 'modern', '', true),
  ('creative_vibrant', 'Creative Vibrant', 'creative', '', true),
  ('nature_green', 'Nature Green', 'healthcare', '', true)
on conflict (layout_key) do nothing;

-- Auto-create profile row on signup
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- Storage bucket `media` — REQUIRED or uploads return 400 / RLS errors
-- Create bucket "media" in Dashboard (public) first, then run this block:
-- ---------------------------------------------------------------------------
drop policy if exists "media_public_select" on storage.objects;
drop policy if exists "media_authenticated_insert" on storage.objects;
drop policy if exists "media_authenticated_update" on storage.objects;
drop policy if exists "media_authenticated_delete" on storage.objects;

create policy "media_public_select"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );

create policy "media_authenticated_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );

create policy "media_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername (name))[1] = (auth.uid ())::text
  );
