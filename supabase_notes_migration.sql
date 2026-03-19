-- ── Notes table ────────────────────────────────────────────────────────────────
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS notes (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          TEXT,
  content        TEXT        NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: each user can only access their own notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_own_notes"
  ON notes
  FOR ALL
  USING     (auth.uid() = participant_id)
  WITH CHECK (auth.uid() = participant_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE PROCEDURE update_notes_updated_at();
