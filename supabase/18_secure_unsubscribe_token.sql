-- ============================================================
-- MQ PLATFORM — SECURE UNSUBSCRIBE TOKENS
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================
--
-- Previously the unsubscribe URL used the raw user UUID:
--   /unsubscribe?id=<user_uuid>
-- Any user or attacker who learned another user's UUID (via logs, shared
-- links, etc.) could unsubscribe them from coaching reminders.
--
-- Fix: use an unguessable random token per profile instead.
--   /unsubscribe?token=<random_uuid>
-- Only someone who received the original email can unsubscribe.
-- ============================================================

-- Add the token column (UUID v4, auto-generated for new rows)
alter table public.profiles
  add column if not exists unsubscribe_token uuid default gen_random_uuid();

-- Backfill any existing rows that don't have a token yet
update public.profiles
  set unsubscribe_token = gen_random_uuid()
  where unsubscribe_token is null;

-- Make sure the token is always present for future rows
alter table public.profiles
  alter column unsubscribe_token set not null;

-- Index for fast lookup when user clicks unsubscribe link
create index if not exists profiles_unsubscribe_token_idx
  on public.profiles(unsubscribe_token);
