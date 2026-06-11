-- Navari Systems — Audit leads from the interactive operations audit tool

CREATE TABLE IF NOT EXISTS audit_leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  email             TEXT NOT NULL,
  industry          TEXT,
  revenue_range     TEXT,
  team_size         TEXT,
  departments       TEXT[],
  tools             TEXT[],
  dynamic_q1        TEXT,
  dynamic_a1        TEXT,
  dynamic_q2        TEXT,
  dynamic_a2        TEXT,
  reflection        TEXT,
  analysis          JSONB,
  profile           TEXT,
  confirmed         BOOLEAN DEFAULT FALSE,
  email_sent        BOOLEAN DEFAULT FALSE,
  alert_sent        BOOLEAN DEFAULT FALSE,
  source            TEXT DEFAULT 'audit-tool',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS audit_leads_email_idx ON audit_leads(email);
CREATE INDEX IF NOT EXISTS audit_leads_created_at_idx ON audit_leads(created_at DESC);
