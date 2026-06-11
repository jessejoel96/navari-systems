-- Secondary goals and AI-suggested challenge selections

ALTER TABLE audit_leads
  ADD COLUMN IF NOT EXISTS secondary_goals TEXT[],
  ADD COLUMN IF NOT EXISTS suggested_challenges TEXT[],
  ADD COLUMN IF NOT EXISTS selected_challenges TEXT[];
