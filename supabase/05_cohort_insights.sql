-- ============================================================
-- 05_cohort_insights.sql
-- Caches AI-generated coaching insights per cohort.
-- The data_hash changes whenever assessment scores change,
-- triggering a fresh generation on next view.
-- ============================================================

create table if not exists public.cohort_insights (
  cohort_id    uuid        primary key references public.cohorts(id) on delete cascade,
  insight_text text        not null,
  data_hash    text        not null,   -- hash of scores used to generate this insight
  generated_at timestamptz not null default now()
);

-- RLS: same pattern as cohorts — JWT app_metadata
alter table public.cohort_insights enable row level security;

-- MQ admins can read/write any insight
create policy "mq_admin full access on cohort_insights"
  on public.cohort_insights
  for all
  using  ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' )
  with check ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin' );

-- Client admins can read insights for their own company's cohorts
create policy "client_admin read own company insights"
  on public.cohort_insights
  for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'client_admin'
    and cohort_id in (
      select id from public.cohorts
      where company_id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::uuid
    )
  );
