-- Combined outbound setup for Supabase SQL Editor
-- Run once: Dashboard → SQL → New query → paste → Run

-- 006_outbound_leads.sql
CREATE TABLE IF NOT EXISTS lead_fetch_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icp_name      TEXT NOT NULL,
  icp_config    JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'running',
  summary       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS outbound_prospects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fetch_run_id      UUID REFERENCES lead_fetch_runs(id) ON DELETE SET NULL,
  apollo_id         TEXT,
  first_name        TEXT,
  last_name         TEXT,
  full_name         TEXT,
  title             TEXT,
  email             TEXT UNIQUE,
  email_status      TEXT,
  linkedin_url      TEXT,
  company_name      TEXT,
  company_domain    TEXT,
  company_industry  TEXT,
  company_size      TEXT,
  location          TEXT,
  icp_score         INTEGER NOT NULL DEFAULT 0,
  icp_tier          TEXT NOT NULL DEFAULT 'cold',
  source            TEXT NOT NULL DEFAULT 'apollo',
  raw               JSONB,
  delivery_status   TEXT NOT NULL DEFAULT 'pending',
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE lead_fetch_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_prospects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS outbound_prospects_email_idx ON outbound_prospects(email);
CREATE INDEX IF NOT EXISTS outbound_prospects_tier_idx ON outbound_prospects(icp_tier);
CREATE INDEX IF NOT EXISTS outbound_prospects_score_idx ON outbound_prospects(icp_score DESC);
CREATE INDEX IF NOT EXISTS outbound_prospects_delivery_idx ON outbound_prospects(delivery_status);
CREATE INDEX IF NOT EXISTS outbound_prospects_run_idx ON outbound_prospects(fetch_run_id);

-- 007_outreach_automation.sql
ALTER TABLE outbound_prospects
  ADD COLUMN IF NOT EXISTS outreach_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS outreach_step INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS outreach_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id     UUID REFERENCES outbound_prospects(id) ON DELETE CASCADE,
  sequence_name   TEXT NOT NULL,
  step_index      INTEGER NOT NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'queued',
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS outreach_messages_prospect_idx ON outreach_messages(prospect_id);
CREATE INDEX IF NOT EXISTS outbound_prospects_outreach_idx ON outbound_prospects(outreach_status);

-- Service role access + PostgREST schema reload
GRANT ALL ON TABLE public.lead_fetch_runs TO service_role;
GRANT ALL ON TABLE public.outbound_prospects TO service_role;
GRANT ALL ON TABLE public.outreach_messages TO service_role;
NOTIFY pgrst, 'reload schema';
