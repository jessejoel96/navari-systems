---
name: lead-intelligence
description: Layer One observation-based outbound for Navari — ICP personas, hybrid discovery, enrichment, observation scoring, AI outreach. Use for B2B prospect lists and personalized cold email.
---

# Lead Intelligence

Observation-based outbound for Navari Systems. **Not generic cold pitch** — specific observation → cost bridge → low-friction offer.

**Canonical docs:**
- `projects/outbound-lead-gen/OUTREACH-METHOD.md`
- `projects/outbound-lead-gen/BUYER-PERSONAS.md`

## Architecture

```
ICP + persona → Hybrid discovery → 15-min observation research → Enrichment waterfall
    → ICP score (+observation bonus) → Supabase → AI personalization → Resend sequence
```

## Layer One message structure

| Part | Content |
|------|---------|
| Opening | Specific observation (not compliment) |
| Bridge | What it costs them |
| Offer | Send findings — not "hire me" on touch 1 |

## When to Activate

- building persona-targeted prospect lists
- vertical campaigns (law, mortgage, estate agency)
- observation-based cold email at scale
- job-board trigger outreach (data entry / bookkeeper hires)

## Navari ICP

| File | Use |
|------|-----|
| `tools/lead-gen/icp.navari.json` | Default multi-persona |
| `tools/lead-gen/icp.law-firms.json` | Persona 1 — Stretched Partner |
| `tools/lead-gen/icp.mortgage-brokers.json` | Persona 2 — Volume Broker |
| `tools/lead-gen/icp.estate-agents.json` | Persona 3 — Agency Director |

Pass `--icp path/to/icp.json` to fetch commands.

## Discovery (hybrid)

Exa + Brave + Apollo (search free) → dedupe → enrich waterfall:
Apollo (capped) → Renidly → Hunter → Snov → verify

## Scoring

| Tier | Criteria |
|------|----------|
| hot | ≥75 — decision-maker + email + industry + **observation documented** |
| warm | ≥55 — good fit, observation pending |
| cold | <55 or no email |

**+12 score** when `observation` field present (>20 chars).

## Outreach

```bash
npm run lead:status         # budget + pipeline before spending credits
npm run lead:daily          # recommended morning plan
npm run lead:fetch:dry
npm run lead:fetch          # budget-gated (Apollo enrich capped)
npm run lead:outreach:dry   # verify observation quality
npm run lead:outreach       # user approval + daily send cap
```

## Credit budget

- Config: `tools/lead-gen/budget.defaults.json`, override `budget.local.json`
- State: `tools/lead-gen/.cache/budget-state.json`
- Skill: `outbound-daily` · Command: `/lead-daily` · UI: `/outbound?key=LEAD_FETCH_SECRET`
- **Never** run live fetch/outreach without checking status first on free Apollo plan

Sequence: `sequences/navari-intro-3.json` — observation + bridge + offer

Personalization: `personalize.ts` uses observation when set; flags `[NEEDS RESEARCH]` otherwise.

## Agent network

| Agent | Role |
|-------|------|
| `lead-crew` | Orchestrator — blocks send without observations |
| `prospect-researcher` | Discovery + 15-min observation research |
| `lead-enricher` | Email waterfall, preserve observation fields |
| `outreach-writer` | Layer One copy |
| `lead-delivery` | CSV with observation columns |

Invoke via `/lead-gen`.

## Required keys (.env.local)

`EXA_API_KEY`, `BRAVE_API_KEY`, `HUNTER_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, Supabase keys. Optional: `APOLLO_API_KEY`, `RENIDLY_API_KEY`, Snov.

## Compliance

CAN-SPAM via Resend unsubscribe · GDPR business email · No LinkedIn scrape automation without approval

## Related

- `outreach-sequencer` — sequence + copy rules
- `brand-voice` — tone lock
