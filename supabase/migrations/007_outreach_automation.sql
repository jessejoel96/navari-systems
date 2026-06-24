-- Outreach automation for outbound prospects

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
