-- ============================================================
-- MQ PLATFORM — EMAIL UNSUBSCRIBE FIELD
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Add coaching reminder unsubscribe flag to profiles
alter table public.profiles
  add column if not exists coaching_reminders_unsubscribed boolean not null default false;
