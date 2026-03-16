-- Daily Spark practice cards
create table if not exists public.daily_sparks (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references auth.users(id) on delete cascade,
  card_number    int  not null check (card_number between 1 and 24),
  dimension_id   int  not null check (dimension_id between 1 and 6),
  title          text,
  teaser         text,
  reflection     text,
  exercise       text,
  insight        text,
  status         text not null default 'active' check (status in ('active', 'complete')),
  assigned_date  date not null default current_date,
  completed_date date,
  created_at     timestamptz not null default now(),
  unique (participant_id, card_number)
);

alter table public.daily_sparks enable row level security;

create policy "participants view own sparks"
  on public.daily_sparks for select
  using (auth.uid() = participant_id);

create policy "participants update own sparks"
  on public.daily_sparks for update
  using (auth.uid() = participant_id);

create policy "service role manages sparks"
  on public.daily_sparks for all
  using (true)
  with check (true);
