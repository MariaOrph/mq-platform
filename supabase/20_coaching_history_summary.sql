-- ============================================================
-- MQ PLATFORM — Mid-session rolling summary on coaching_chats
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================
--
-- Adds two nullable columns to the conversational-chat table:
--   history_summary          text  — Haiku-generated summary of all
--                                    messages older than the last 20
--                                    in the current session.
--   history_summary_through  int   — How many messages from the start
--                                    of the session are folded into
--                                    the stored summary. Used to
--                                    decide when to refresh.
--
-- Both columns are nullable. Sessions ≤ 20 messages never read or
-- write them. Older sessions read them every turn and write them
-- whenever drift hits 6+ new older messages.
--
-- Safe to run multiple times — uses `if not exists`.
-- ============================================================

alter table public.coaching_chats
  add column if not exists history_summary text;

alter table public.coaching_chats
  add column if not exists history_summary_through int;

comment on column public.coaching_chats.history_summary is
  'Rolling Haiku-generated summary of messages older than the last 20 in this session. Refreshed every 6 new older messages. See src/lib/coaching-history.ts.';

comment on column public.coaching_chats.history_summary_through is
  'Number of messages from the start of the session folded into history_summary. Drives the refresh decision.';
