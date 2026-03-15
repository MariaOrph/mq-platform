-- ============================================================
-- MQ PLATFORM — COHORTS & COHORT PARTICIPANTS
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Cohort type enum
create type cohort_type as enum ('Baseline', 'Post-programme', 'Sales discovery');

-- Cohort status enum
create type cohort_status as enum ('Draft', 'Active', 'Complete');

-- ============================================================
-- COHORTS TABLE
-- ============================================================
create table if not exists public.cohorts (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references public.companies(id) on delete cascade not null,
  name         text not null,
  type         cohort_type not null default 'Baseline',
  status       cohort_status not null default 'Draft',
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);

alter table public.cohorts enable row level security;

create policy "MQ Admins can manage all cohorts"
  on public.cohorts for all
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

create policy "Client Admins can manage own company cohorts"
  on public.cohorts for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin'
    and company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );

-- ============================================================
-- COHORT PARTICIPANTS TABLE
-- ============================================================
create table if not exists public.cohort_participants (
  id              uuid primary key default gen_random_uuid(),
  cohort_id       uuid references public.cohorts(id) on delete cascade not null,
  email           text not null,
  participant_id  uuid references public.profiles(id) on delete set null,
  assessment_id   uuid references public.assessments(id) on delete set null,
  invited_at      timestamptz,
  created_at      timestamptz default now(),
  unique (cohort_id, email)
);

alter table public.cohort_participants enable row level security;

create policy "MQ Admins can manage all cohort participants"
  on public.cohort_participants for all
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

create policy "Client Admins can manage own cohort participants"
  on public.cohort_participants for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin'
    and cohort_id in (
      select c.id from public.cohorts c
      join public.profiles p on p.id = auth.uid()
      where c.company_id = p.company_id
    )
  );

create policy "Participants can view own cohort membership"
  on public.cohort_participants for select
  using ( participant_id = auth.uid() );

-- ============================================================
-- AUTO-LINK TRIGGER
-- When a participant submits an assessment, automatically
-- update their cohort_participants row with the assessment_id
-- and their profile ID (so dashboard can join to get scores).
-- ============================================================
create or replace function public.link_assessment_to_cohort()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_email text;
begin
  -- Look up the participant's email from their profile
  select email into v_email
  from public.profiles
  where id = new.participant_id;

  -- Update any cohort_participants rows for this email
  -- that haven't been linked to an assessment yet
  update public.cohort_participants
  set
    participant_id = new.participant_id,
    assessment_id  = new.id
  where
    email = v_email
    and assessment_id is null;

  return new;
end;
$$;

drop trigger if exists on_assessment_created on public.assessments;
create trigger on_assessment_created
  after insert on public.assessments
  for each row execute function public.link_assessment_to_cohort();
