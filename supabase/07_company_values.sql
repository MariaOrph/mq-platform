-- ============================================================
-- MQ PLATFORM — ADD COMPANY VALUES TO COHORTS
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Add optional company values field to cohorts
alter table public.cohorts
  add column if not exists company_values text;
