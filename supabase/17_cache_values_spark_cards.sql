-- ============================================================
-- MQ PLATFORM — CACHE PRE-GENERATED VALUES SPARK CARDS
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================
--
-- Adds columns to company_value_behaviours so that values Daily Spark cards
-- are generated ONCE per company-value (not per user) and reused by every
-- participant in that company. Saves ~80-90% on Daily Spark AI costs.
--
-- Behaviour:
--   - First user to request a values card for "Integrity" triggers AI generation
--     and the result is saved here.
--   - Every subsequent user reads directly from these columns — no AI call.
--   - If an admin edits the value's behaviours, these columns should be cleared
--     (regeneration happens automatically on next request when columns are null).
-- ============================================================

alter table public.company_value_behaviours
  add column if not exists spark_title     text,
  add column if not exists spark_teaser    text,
  add column if not exists spark_insight   text,
  add column if not exists spark_exercise  text;

-- Optional: index for quick cache lookup (probably not needed, rows are small)
-- Not creating one to keep writes fast.

-- Helper: clear the cache for a specific value (if admin edits behaviours)
-- Admin UI should call this (or we can add a trigger later). For now, manual.
-- Example:
--   update public.company_value_behaviours
--   set spark_title = null, spark_teaser = null, spark_insight = null, spark_exercise = null
--   where id = '<value_id>';
