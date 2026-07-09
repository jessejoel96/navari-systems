---
name: outreach-sequencer
description: Layer One observation-based multi-touch outbound for Navari. Opening → Bridge → Offer. Use for cold email sequences after lead discovery and 15-min research.
---

# Outreach Sequencer

**Method:** `projects/outbound-lead-gen/OUTREACH-METHOD.md`  
**Personas:** `projects/outbound-lead-gen/BUYER-PERSONAS.md`

Observation-based outbound — never generic cold pitch.

## Sequence

`tools/lead-gen/sequences/navari-intro-3.json`

| Step | Day | Purpose | Structure |
|------|-----|---------|-----------|
| 1 | 0 | First contact | Observation → Bridge → Offer |
| 2 | 3 | Value follow-up | Proof point, no hard pitch |
| 3 | 5 | Final bump | Restate offer to send findings |

## Touch 1 template

```
[Opening — specific observation about their visible situation]

[Bridge — what this costs them]

[Offer — low-friction CTA]
I mapped out three specific changes that would shift this within 60 days.
Would it be useful if I sent you what I found?

— Jesse, Navari Systems
AI Automation Specialist
```

## Personalization inputs (required for touch 1)

- `observation` — from 15-min research (**mandatory**)
- `observation_source` — website, jobs page, etc.
- `persona` — from BUYER-PERSONAS
- `full_name`, `title`, `company_name`, `company_industry`

## Commands

```bash
npm run lead:outreach:dry -- --tier hot --limit 5
npm run lead:outreach -- --tier hot --limit 10
npm run lead:outreach -- --sequence navari-intro-3 --tier warm
```

## Copy rules

1. Touch 1 ≤120 words; follow-ups ≤90
2. **No compliment-only openers** — observation must be specific
3. **No "hire me" on touch 1** — offer to send findings
4. One CTA per email
5. Sign: Jesse, Navari Systems (AI Automation Specialist in signature)
6. Banned: "I hope this finds you well", "I wanted to reach out", hype

## Job-board trigger (alternate touch 1)

When `buying_signal` = hiring for manual role:

> I noticed [Company] is hiring for [role] to manage [task]. I build automation systems that handle this without the ongoing headcount cost — most clients see payback in 6–8 weeks versus a salaried hire. Worth a 20-minute look?

## Agent handoff

- `prospect-researcher` → documents observation
- `outreach-writer` → drafts + dry-run
- `lead-crew` → blocks if >20% missing observations
- `lead-delivery` → CSV + Supabase log

## After send

- Reply → manual follow-up / Calendly
- No reply after step 3 → mark cold, pause sequence
