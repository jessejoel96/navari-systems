-- Expand audit_leads with richer intake fields

ALTER TABLE audit_leads
  ADD COLUMN IF NOT EXISTS sub_industry TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS workforce_type TEXT,
  ADD COLUMN IF NOT EXISTS urgency TEXT,
  ADD COLUMN IF NOT EXISTS pain_point TEXT;
