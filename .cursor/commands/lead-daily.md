---
description: Credit-aware daily outbound — budget overview, gated fetch/outreach, observation research first.
allowed_tools: ["Read", "Grep", "Glob", "Shell", "Write"]
---

# /lead-daily

Run **every morning** before spending API credits. Respects Apollo free plan and monthly/daily caps.

## Usage

```
/lead-daily                    # Status + recommended plan (same as lead:status)
/lead-daily status             # Credit meters + pipeline counts
/lead-daily research           # Delegate prospect-researcher for missing observations
/lead-daily fetch-dry          # npm run lead:fetch:dry
/lead-daily fetch              # npm run lead:fetch (budget-gated)
/lead-daily outreach-dry       # npm run lead:outreach:dry --tier hot --limit 5
/lead-daily ui                 # Open /outbound dashboard
```

## CLI

```bash
npm run lead:status
npm run lead:daily -- --json
```

## Workflow (lead-crew orchestrates)

1. **Status** — show Apollo / Exa / Hunter / OpenAI / Resend remaining  
2. **Research** — if `missingObservationHot > 0`, run 15-min observation pass  
3. **Fetch dry** — always free preview  
4. **Fetch live** — only if `fetch_runs` + Apollo credits allow  
5. **Outreach dry** — review Layer One copy  
6. **Outreach live** — user approval required; respects daily send cap  

## Skills & agents

- Skill: `outbound-daily`, `lead-intelligence`, `outreach-sequencer`
- Agents: `lead-crew`, `prospect-researcher`, `outreach-writer`, `lead-delivery`

## Dashboard

`/outbound?key=LEAD_FETCH_SECRET` — pipeline overview (Navari navy/gold, Apollo-style layout)

## Budget config

- Defaults: `tools/lead-gen/budget.defaults.json`
- Override: `tools/lead-gen/budget.local.json` (gitignored)
