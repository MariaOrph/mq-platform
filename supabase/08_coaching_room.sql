-- ============================================================
-- MQ PLATFORM — COACHING ROOM MESSAGES
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

create table if not exists public.coaching_room_messages (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references auth.users(id) on delete cascade,
  role           text not null check (role in ('user', 'assistant')),
  content        text not null,
  created_at     timestamptz not null default now()
);

alter table public.coaching_room_messages enable row level security;

create policy "Participants own their coaching room messages"
  on public.coaching_room_messages for all
  using (participant_id = auth.uid());

create policy "MQ Admins can read all coaching room messages"
  on public.coaching_room_messages for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'mq_admin');

create index coaching_room_messages_participant_created
  on public.coaching_room_messages (participant_id, created_at desc);
