---
description: Layer One observation-based outbound for Navari — persona ICP, hybrid discovery, 15-min research, AI copy, Resend sequences.
allowed_tools: ["Read", "Grep", "Glob", "Shell", "Write"]
---

# /lead-gen

**Observation-based outbound** for navari.systems — not generic cold pitching.

**Read first:**
- `projects/outbound-lead-gen/OUTREACH-METHOD.md`
- `projects/outbound-lead-gen/BUYER-PERSONAS.md`

## Usage

```
/lead-gen                              # Pipeline overview + persona selection
/lead-gen icp                          # Refine ICP / pick persona campaign
/lead-gen research                     # 15-min observation pass on prospects
/lead-gen fetch [--limit 25]           # Hybrid discovery → enrich → Supabase
/lead-gen fetch --dry-run              # Preview without saving
/lead-gen outreach [--tier hot]        # Observation-based AI email
/lead-gen outreach --dry-run           # Review before send (check observations)
/lead-gen deliver                      # Export CSV with observation columns
```

## Layer One method

```
Identify business → 15 min research → document ONE visible problem
→ Opening (observation) → Bridge (cost) → Offer (send findings, not hire me)
```

## Pipeline

```
Exa + Brave + Apollo → Renidly/Hunter/Snov → observation scoring
→ Supabase → OpenAI (observation-aware) → Resend 3-touch
```

## Persona ICP files

| Campaign | File |
|----------|------|
| Default | `tools/lead-gen/icp.navari.json` |
| Law firms | `tools/lead-gen/icp.law-firms.json` |
| Mortgage brokers | `tools/lead-gen/icp.mortgage-brokers.json` |
| Estate agents | `tools/lead-gen/icp.estate-agents.json` |

## Prerequisites (.env.local)

`EXA_API_KEY`, `BRAVE_API_KEY`, `HUNTER_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, Supabase keys. Optional: Apollo, Renidly, Snov.

## Agent network

| Agent | Role |
|-------|------|
| `lead-crew` | Orchestrator — enforces observation gate |
| `prospect-researcher` | Discovery + 15-min observations |
| `lead-enricher` | Email waterfall |
| `outreach-writer` | Layer One copy |
| `lead-delivery` | Export + logging |

Skills: `outbound-daily`, `lead-intelligence`, `outreach-sequencer`, `brand-voice`

## Daily / budget

Before fetch or outreach, run `/lead-daily` or `npm run lead:status`. Pipeline respects `budget.defaults.json` + optional `budget.local.json`. Dashboard: `/outbound?key=LEAD_FETCH_SECRET`.

## Examples

```
/lead-gen icp for law firms — Stretched Partner persona — then fetch
```

```
/lead-gen research top 10 warm leads from last fetch — document observations
```

```
/lead-gen outreach --dry-run for hot leads with observations only
```

---

*Navari Layer One — observe, bridge, offer*
