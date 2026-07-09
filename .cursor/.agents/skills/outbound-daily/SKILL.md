---
name: outbound-daily
description: Credit-aware daily outbound workflow for Navari. Run status overview, respect Apollo free-plan and API budgets, orchestrate research → fetch → outreach. Use every morning before spending API credits.
---

# Outbound Daily — Credit-Aware Workflow

**Method:** Layer One observation-based outreach  
**Budget:** `tools/lead-gen/budget.defaults.json` (+ optional `budget.local.json`)

## Morning routine (automated)

```bash
npm run lead:status          # Credit meters + pipeline + today's plan
npm run lead:daily -- --json # Same, machine-readable for agents
```

## Daily task order (do not skip gates)

| Step | Action | API cost |
|------|--------|----------|
| 1 | `lead:status` | Free |
| 2 | Research observations (`prospect-researcher`) | Free (web only) |
| 3 | `lead:fetch:dry` | Free |
| 4 | `lead:fetch` if Apollo + fetch budget remain | Apollo enrich capped |
| 5 | `lead:outreach:dry` | OpenAI (preview) |
| 6 | `lead:outreach` only after user approves dry-run | OpenAI + Resend |

## Free-plan defaults (Apollo)

| Operation | Cost | Gate |
|-----------|------|------|
| People search | 0 credits | max 2 pages/run on free |
| Bulk enrich | 1 credit/contact | only `has_email`, cap 10/run, 50/mo |
| Exa / Brave | per search | daily + monthly caps in budget file |

## Budget override

Copy limits to `tools/lead-gen/budget.local.json`:

```json
{
  "monthly": { "apollo_enrich_credits": 50 },
  "daily": { "apollo_enrich_credits": 10, "fetch_runs": 2, "outreach_sends": 15 }
}
```

State persists in `tools/lead-gen/.cache/budget-state.json`.

## Agent routing

| Trigger | Agent |
|---------|-------|
| Full daily orchestration | `lead-crew` |
| Observation research | `prospect-researcher` |
| Dry-run review | `outreach-writer` |
| Export / logging | `lead-delivery` |

## UI

Open `/outbound` (requires `LEAD_FETCH_SECRET` query or header) for Apollo-style pipeline dashboard with Navari branding.

## Blockers

- `missingObservationHot > 0` → research before outreach  
- Apollo daily/monthly at 100% → skip fetch enrich, use Hunter-only path  
- `fetch_runs` daily cap → no live fetch until tomorrow

Invoke via `/lead-daily` or `/lead-gen daily`.
