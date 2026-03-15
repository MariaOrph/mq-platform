-- ============================================================
-- MQ PLATFORM — FIX RLS RECURSION
-- Store role in JWT app_metadata so policies never query profiles
-- ============================================================

-- ── 1. SET ROLE IN JWT FOR EXISTING USERS ───────────────────
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role": "mq_admin"}'::jsonb
where email in ('maria@mindsetquo.com', 'richard@mindsetquo.com');

-- ── 2. DROP ALL OLD POLICIES ────────────────────────────────
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "MQ Admins can view all profiles" on public.profiles;
drop policy if exists "MQ Admins can manage all profiles" on public.profiles;
drop policy if exists "Client Admins can view their company profiles" on public.profiles;
drop policy if exists "Client Admins can update their company profiles" on public.profiles;
drop policy if exists "MQ Admins can manage all companies" on public.companies;
drop policy if exists "Users can view their own company" on public.companies;

-- ── 3. RECREATE POLICIES USING JWT (no table queries = no recursion) ──
-- auth.jwt() reads the token already in memory — no DB query needed

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "MQ Admins can view all profiles"
  on public.profiles for select
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

create policy "MQ Admins can manage all profiles"
  on public.profiles for all
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

create policy "Client Admins can view their company profiles"
  on public.profiles for select
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin' );

create policy "Client Admins can update their company profiles"
  on public.profiles for update
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin' );

create policy "MQ Admins can manage all companies"
  on public.companies for all
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

create policy "Users can view their own company"
  on public.companies for select
  using ( id = (select company_id from public.profiles where id = auth.uid()) );

-- ── 4. UPDATE TRIGGER TO SYNC ROLE INTO JWT ON NEW USERS ────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  _role text;
begin
  _role := coalesce(new.raw_user_meta_data->>'role', 'participant');

  insert into public.profiles (id, email, role, company_id, full_name)
  values (
    new.id,
    new.email,
    _role::public.user_role,
    (new.raw_user_meta_data->>'company_id')::uuid,
    new.raw_user_meta_data->>'full_name'
  );

  -- Keep app_metadata in sync so RLS policies can read role from JWT
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', _role)
  where id = new.id;

  return new;
end;
$$;

