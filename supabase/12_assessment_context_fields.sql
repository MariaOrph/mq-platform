-- Migration: add job_title and company_type to assessments table
-- These fields give the AI coaching system richer context about each participant,
-- enabling more relevant examples and personalised coaching.

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS job_title    TEXT,
  ADD COLUMN IF NOT EXISTS company_type TEXT;
