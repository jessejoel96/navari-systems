---
name: outreach-sequencer
description: Design and run multi-touch outbound email sequences with AI personalization for Navari Systems. Use when executing cold outreach, follow-ups, or scaling personalized email after lead discovery.
---

# Outreach Sequencer

Personalized outbound at scale — without Apollo. Works on prospects from `lead-intelligence` / `tools/lead-gen`.

## Sequence structure

Default: `tools/lead-gen/sequences/navari-intro-3.json`

| Step | Day | Purpose |
|------|-----|---------|
| 1 | 0 | Problem + Navari offer |
| 2 | 3 | Follow-up with value |
| 3 | 5 | Final bump |

## Personalization inputs

Per prospect, the writer uses:
- `full_name`, `title`, `company_name`, `company_industry`
- Navari positioning from `src/lib/constants.ts` and `src/lib/workflows.ts`
- `brand-voice` profile when available

## Commands

```bash
npm run lead:outreach:dry -- --tier hot --limit 5
npm run lead:outreach -- --tier hot --limit 10
npm run lead:outreach -- --sequence navari-intro-3 --tier warm
```

## Copy rules

1. Under 120 words (step 1), under 90 (follow-ups)
2. One specific pain — manual ops, slow lead response, scattered tools
3. One CTA — reply or navari.systems
4. No "I hope this finds you well", no hype
5. Sign as Jesse, Navari Systems

## Agent handoff

- `outreach-writer` drafts and reviews copy
- `lead-delivery` confirms tier + email status before send
- `lead-crew` approves batch before `npm run lead:outreach`

## Logging

Sent messages stored in Supabase `outreach_messages`. Prospect `outreach_step` tracks sequence progress.

## After send

- Hot replies → manual follow-up or Calendly
- No reply after step 3 → mark cold, pause sequence
- Sync contacts to Resend segment via `src/lib/resend/contacts.ts`
