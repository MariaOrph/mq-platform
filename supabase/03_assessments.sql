-- ============================================================
-- MQ PLATFORM — ASSESSMENTS TABLE
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

create table if not exists public.assessments (
  id               uuid primary key default gen_random_uuid(),
  participant_id   uuid references public.profiles(id) on delete cascade,
  company_id       uuid references public.companies(id) on delete set null,
  first_name       text not null,
  participant_role text not null check (participant_role in ('manager', 'leader')),
  responses        integer[] not null,        -- 24 scores in order
  d1_score         integer not null,          -- Self-awareness
  d2_score         integer not null,          -- Cognitive flexibility
  d3_score         integer not null,          -- Emotional regulation
  d4_score         integer not null,          -- Values clarity
  d5_score         integer not null,          -- Relational mindset
  d6_score         integer not null,          -- Adaptive resilience
  overall_score    integer not null,
  completed_at     timestamptz default now(),
  created_at       timestamptz default now()
);

alter table public.assessments enable row level security;

-- Participants can create and view their own assessments
create policy "Participants can manage own assessments"
  on public.assessments for all
  using ( auth.uid() = participant_id );

-- Client Admins can view assessments for participants in their company
-- NOTE: the app layer must NOT expose individual question responses or
-- per-dimension scores to Client Admins — only overall_score is shown.
create policy "Client Admins can view company assessments"
  on public.assessments for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin'
    and company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );

-- MQ Admins can see and manage everything
create policy "MQ Admins can manage all assessments"
  on public.assessments for all
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

