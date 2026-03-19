-- Migration: 360 feedback tables

-- Stores each feedback request sent by a participant
CREATE TABLE IF NOT EXISTS feedback_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  respondent_email TEXT NOT NULL,
  respondent_name  TEXT,
  relationship     TEXT,
  token            UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- Stores each completed survey response (no direct participant access — results served via API as aggregates only)
CREATE TABLE IF NOT EXISTS feedback_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id     UUID NOT NULL REFERENCES feedback_requests(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  d1_score       NUMERIC,
  d2_score       NUMERIC,
  d3_score       NUMERIC,
  d4_score       NUMERIC,
  d5_score       NUMERIC,
  d6_score       NUMERIC,
  d7_score       NUMERIC,
  values_ratings JSONB,
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE feedback_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Participants can manage their own requests
CREATE POLICY "participants manage own requests"
  ON feedback_requests FOR ALL
  USING (participant_id = auth.uid())
  WITH CHECK (participant_id = auth.uid());

-- Responses are not directly readable by participants (API aggregates only)
-- Service role key bypasses RLS and is used by all API routes
