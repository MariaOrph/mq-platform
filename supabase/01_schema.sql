-- ============================================================
-- MQ PLATFORM — DATABASE SCHEMA
-- Run this entire file in: Supabase → SQL Editor → New Query
-- ============================================================


-- ── 1. COMPANIES ────────────────────────────────────────────
-- Each client organisation (e.g. "Acme Corp") is a company.
-- Participants and Client Admins belong to a company.
-- MQ Admins do not belong to any company.

create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);


-- ── 2. USER ROLES ───────────────────────────────────────────
-- Three roles in the system.
-- Using a type (enum) so only valid values can be stored.

create type public.user_role as enum (
  'mq_admin',      -- Maria & Richard — full access to everything
  'client_admin',  -- Head of People etc — sees their company only
  'participant'    -- Manager/leader on programme — sees own data only
);


-- ── 3. PROFILES ─────────────────────────────────────────────
-- Extends Supabase's built-in auth.users table.
-- Every user gets one profile row, created automatically on invite.

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         public.user_role not null default 'participant',
  company_id   uuid references public.companies(id) on delete set null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);


-- ── 4. AUTO-CREATE PROFILE ON USER INVITE ───────────────────
-- Whenever Supabase creates a new auth user (via invite),
-- this function automatically inserts a matching profiles row.
-- The role and company_id are passed in via the invitation metadata.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, company_id, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'participant'
    ),
    (new.raw_user_meta_data->>'company_id')::uuid,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Attach the function to fire whenever a new auth user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── 5. ROW LEVEL SECURITY (RLS) ─────────────────────────────
-- This is the privacy enforcement layer.
-- "Enable RLS" means: by default, no one can see any row.
-- We then add policies to grant access back selectively.

alter table public.companies  enable row level security;
alter table public.profiles   enable row level security;


-- ── PROFILES: who can see what ──────────────────────────────

-- Everyone can always read their own profile row
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- MQ Admins can see ALL profiles across all companies
create policy "MQ Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'mq_admin'
    )
  );

-- Client Admins can see profiles belonging to their own company only
-- PRIVACY RULE: they can see who's in their company, but NOT individual
-- question responses, dimension breakdowns, or coaching content (those
-- are enforced by RLS on the data tables we'll create in later stages).
create policy "Client Admins can view their company profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client_admin'
        and p.company_id = profiles.company_id
    )
  );

-- MQ Admins can create, update, delete any profile
create policy "MQ Admins can manage all profiles"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'mq_admin'
    )
  );

-- Client Admins can update profiles in their own company
create policy "Client Admins can update their company profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'client_admin'
        and p.company_id = profiles.company_id
    )
  );


-- ── COMPANIES: who can see what ─────────────────────────────

-- MQ Admins can see and manage all companies
create policy "MQ Admins can manage all companies"
  on public.companies for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'mq_admin'
    )
  );

-- Client Admins and Participants can see their own company only
create policy "Users can view their own company"
  on public.companies for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.company_id = companies.id
    )
  );


-- ── 6. HELPER FUNCTION ──────────────────────────────────────
-- A convenience function to get the current user's role.
-- Used in RLS policies and server-side checks.

create or replace function public.get_my_role()
returns public.user_role
language sql
security definer set search_path = ''
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

