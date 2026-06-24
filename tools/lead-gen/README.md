# Navari Outbound

Find leads and run personalized outreach — **no Apollo required**.

**Project spec:** [`projects/outbound-lead-gen/PROJECT.md`](../../projects/outbound-lead-gen/PROJECT.md)  
**Runbook:** [`projects/outbound-lead-gen/WORKFLOW.md`](../../projects/outbound-lead-gen/WORKFLOW.md)

## How it works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Brave Search│ →  │ Hunter.io   │ →  │ ICP Score   │ →  │ Supabase    │
│ (discovery) │    │ (emails)    │    │ hot/warm    │    │ prospects   │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
                    ┌─────────────┐    ┌─────────────┐          │
                    │ Resend      │ ←  │ OpenAI      │ ←────────┘
                    │ (send)      │    │ (personalize)│
                    └─────────────┘    └─────────────┘
```

## Agent network

| Agent | Job |
|-------|-----|
| `lead-crew` | Orchestrator |
| `prospect-researcher` | Web discovery |
| `lead-enricher` | Hunter emails |
| `outreach-writer` | AI sequences |
| `lead-delivery` | Export + logging |

In Cursor: `/lead-gen`

## Setup

### 1. Keys (`.env.local`)

```env
BRAVE_API_KEY=...
HUNTER_API_KEY=...
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
npm run lead:fetch:dry      # preview discovery
npm run lead:fetch          # discover → enrich → save
npm run lead:outreach:dry   # preview AI emails
npm run lead:outreach       # send to hot leads
npm run lead:deliver        # export CSV
```

## ICP

Edit `icp.navari.json`. Set `discovery_provider` to `"apollo"` only if you have Apollo API access.

## Sequences

`sequences/navari-intro-3.json` — 3-touch cold email. Add more JSON files for vertical campaigns.
