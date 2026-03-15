-- ============================================================
-- 06_coaching_sessions.sql
-- Stores each participant's daily coaching moment — generated
-- content, their private reflection, and completion status.
-- One session per participant per day (unique constraint).
-- ============================================================

create table if not exists public.coaching_sessions (
  id               uuid        primary key default gen_random_uuid(),
  participant_id   uuid        not null references auth.users(id) on delete cascade,
  session_date     date        not null default current_date,

  -- Which dimension was the focus
  dimension_id     int         not null check (dimension_id between 1 and 6),

  -- What the participant shared as context (null = skipped)
  context_provided text,

  -- AI-generated content
  heading          text,
  reflection_ai    text,
  practice_title   text,
  practice_body    text,
  insight_body     text,
  insight_quote    text,

  -- Participant's private notes — never shown to client admins
  user_reflection  text,

  -- Lifecycle
  status           text        not null default 'draft'
                   check (status in ('draft', 'complete', 'saved_for_later')),
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),

  unique (participant_id, session_date)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.coaching_sessions enable row level security;

-- Participants can read and write only their own sessions
create policy "participants own sessions"
  on public.coaching_sessions
  for all
  using  (auth.uid() = participant_id)
  with check (auth.uid() = participant_id);

-- MQ admins can read all sessions (for support / quality review)
create policy "mq_admin read all coaching sessions"
  on public.coaching_sessions
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin');
