-- Migration 16: Scenario Simulator scores table
-- Tracks each participant's score per scenario for XP / levelling system

CREATE TABLE IF NOT EXISTS simulator_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id     text NOT NULL,          -- e.g. 'psych-safety', 'accountability', 'inclusion', 'values'
  score           integer NOT NULL,       -- raw points 0–6
  stars           integer NOT NULL,       -- 1, 2, or 3
  xp_earned       integer NOT NULL,       -- stars × 50
  completed_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast per-participant lookups
CREATE INDEX IF NOT EXISTS simulator_scores_participant_idx
  ON simulator_scores (participant_id);

-- Row Level Security
ALTER TABLE simulator_scores ENABLE ROW LEVEL SECURITY;

-- Participants can only see / insert their own rows
CREATE POLICY "participants_own_simulator_scores"
  ON simulator_scores
  FOR ALL
  USING (participant_id = auth.uid())
  WITH CHECK (participant_id = auth.uid());
