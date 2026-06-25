# Navari Outbound

Find leads and run personalized outreach — Apollo-free by default, with optional Apollo free-plan search.

**Project spec:** [`projects/outbound-lead-gen/PROJECT.md`](../../projects/outbound-lead-gen/PROJECT.md)  
**Outreach method:** [`projects/outbound-lead-gen/OUTREACH-METHOD.md`](../../projects/outbound-lead-gen/OUTREACH-METHOD.md)  
**Buyer personas:** [`projects/outbound-lead-gen/BUYER-PERSONAS.md`](../../projects/outbound-lead-gen/BUYER-PERSONAS.md)

## How it works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Exa + Brave │ →  │ Apollo*     │ →  │ Renidly /   │ →  │ Supabase    │
│ + Apollo*   │    │ enrich*     │    │ Hunter/Snov │    │ prospects   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
                    ┌─────────────┐    ┌─────────────┐          │
                    │ Resend      │ ←  │ OpenAI      │ ←────────┘
                    │ (send)      │    │ (personalize)│
                    └─────────────┘    └─────────────┘

* Apollo: search is free; enrichment uses credits (free plan: has_email only, cap 10/run)
```

## Agent network

| Agent | Job |
|-------|-----|
| `lead-crew` | Orchestrator |
| `prospect-researcher` | Web discovery |
| `lead-enricher` | Email waterfall |
| `outreach-writer` | AI sequences |
| `lead-delivery` | Export + logging |

In Cursor: `/lead-gen`

## Setup

### 1. Keys (`.env.local`)

```env
EXA_API_KEY=...
BRAVE_API_KEY=...
APOLLO_API_KEY=...          # optional — free plan search + capped enrich
RENIDLY_API_KEY=...
HUNTER_API_KEY=...
SNOV_CLIENT_ID=...
SNOV_CLIENT_SECRET=...
OPENAI_API_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Navari Systems <jessejoel@navari.systems>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Migrations

Apply `006_outbound_leads.sql` and `007_outreach_automation.sql`.

### 3. Install

```bash
npm install --prefix tools/lead-gen
```

## Commands

```bash
npm run lead:fetch:dry      # preview discovery (no enrichment)
npm run lead:fetch          # discover → enrich → save
npm run lead:outreach:dry   # preview AI emails
npm run lead:outreach       # send to hot leads
npm run lead:deliver        # export CSV
npm run lead:status         # credit meters + pipeline (CLI)
npm run lead:daily          # daily overview + recommendations
```

## Credit budget (free Apollo plan)

Defaults in `budget.defaults.json` (50 Apollo enrich/month, 10/day, etc.). Override locally:

```bash
cp tools/lead-gen/budget.local.example.json tools/lead-gen/budget.local.json
```

Usage is tracked in `tools/lead-gen/.cache/budget-state.json` (gitignored).

**Daily workflow:** `/lead-daily` or `npm run lead:status` before fetch/outreach. Web UI: `/outbound?key=LEAD_FETCH_SECRET`.

## ICP

Edit `icp.navari.json` or use persona campaigns:

| File | Persona |
|------|---------|
| `icp.navari.json` | Default (multi-persona) |
| `icp.law-firms.json` | The Stretched Partner |
| `icp.mortgage-brokers.json` | The Volume Broker |
| `icp.estate-agents.json` | The Stretched Agency Director |

| Field | Default | Notes |
|-------|---------|-------|
| `discovery_provider` | `hybrid` | Exa + Brave + Apollo when keyed |
| `persona` | — | Label for outreach personalization |
| `observation_focus` | — | What researchers look for on each account |
| `apollo_plan` | `free` | Search free; enrich capped |

**Observation gate:** Document `observation` per prospect before touch 1. Scoring adds +12 when present.

## Sequences

`sequences/navari-intro-3.json` — Layer One 3-touch (observation → bridge → offer).
