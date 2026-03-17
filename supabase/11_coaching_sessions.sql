-- ── coaching_sessions ─────────────────────────────────────────────────────────
create table if not exists public.coaching_sessions (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references auth.users(id) on delete cascade,
  title          text not null default 'New conversation',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  message_count  int not null default 0
);

alter table public.coaching_sessions enable row level security;

create policy "participants_own_sessions" on public.coaching_sessions
  for all using (auth.uid() = participant_id);

create policy "service_role_all_sessions" on public.coaching_sessions
  for all using (true) with check (true);

-- ── Add session_id to coaching_room_messages ──────────────────────────────────
alter table public.coaching_room_messages
  add column if not exists session_id uuid references public.coaching_sessions(id) on delete cascade;

-- ── Add coaching_memory to profiles ──────────────────────────────────────────
alter table public.profiles
  add column if not exists coaching_memory text;

-- ── Migrate existing messages into a legacy session per participant ───────────
do $$
declare
  pid uuid;
  sid uuid;
begin
  for pid in
    select distinct participant_id
    from public.coaching_room_messages
    where session_id is null
  loop
    insert into public.coaching_sessions (participant_id, title, created_at, updated_at)
    values (
      pid,
      'Previous conversations',
      (select min(created_at) from public.coaching_room_messages where participant_id = pid),
      (select max(created_at) from public.coaching_room_messages where participant_id = pid)
    )
    returning id into sid;

    update public.coaching_room_messages
    set session_id = sid
    where participant_id = pid and session_id is null;

    update public.coaching_sessions
    set message_count = (select count(*) from public.coaching_room_messages where session_id = sid)
    where id = sid;
  end loop;
end $$;
