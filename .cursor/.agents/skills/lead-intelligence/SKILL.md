---
name: lead-intelligence
description: Define ICP, discover B2B prospects via web research, enrich contacts, score fit, and deliver qualified leads with AI outreach for Navari Systems. No Apollo required. Use for outbound targeting, prospect lists, and automated personalized email.
---

# Lead Intelligence

Apollo-like outbound for Navari Systems — **without a proprietary B2B database**. Discover via web search, enrich via Hunter, personalize via OpenAI, send via Resend.

## Architecture

```
ICP → Web discovery (Brave) → Email enrichment (Hunter) → ICP score
    → Supabase → AI personalization (OpenAI) → Outreach sequence (Resend)
```

Agents orchestrate; `tools/lead-gen` CLI runs the automated pipeline.

## When to Activate

- building outbound prospect lists
- refining ICP for a vertical campaign
- running personalized cold email at scale
- connecting inbound audit leads to nurture sequences

## Navari ICP (default)

`tools/lead-gen/icp.navari.json` — founders and ops leaders at 11–200 employee SMBs in professional services, real estate, law, financial services, marketing, e-learning.

## Discovery (no Apollo)

**Provider:** `discovery_provider: "web"` (default)

1. Build search queries from ICP (titles + industries + geos)
2. **Brave Search API** — LinkedIn profiles, company sites, team pages
3. Parse results into prospects (name, title, company, domain, LinkedIn)
4. **Hunter** — email finder + domain search + verification

**Agent-assisted discovery** (Cursor MCP):
- `brave-search` — deeper company research, buying signals
- `deep-research` / `market-research` — vertical intel before ICP lock
- `exa-search` — neural company search (if Exa MCP active)

Optional: set `discovery_provider: "apollo"` in ICP JSON only if you have `APOLLO_API_KEY`.

## Enrichment waterfall

```
Hunter name+domain → Hunter domain search (match title) → Hunter verify
```

Never invent emails. Mark status: verified, valid, likely, guessed, invalid.

## Scoring

| Tier | Score | Criteria |
|------|-------|----------|
| hot | ≥75 | Decision-maker title + email + ICP industry |
| warm | ≥55 | Good title or company fit |
| cold | <55 | Weak fit or missing data |

## Outreach automation

```bash
npm run lead:fetch          # discover + enrich + save
npm run lead:outreach:dry   # preview AI emails
npm run lead:outreach       # send step 1 to hot leads via Resend
```

Sequence: `tools/lead-gen/sequences/navari-intro-3.json` (3-touch)

Personalization uses `OPENAI_API_KEY` + Navari positioning. Falls back to templates if unset.

## Agent network

| Agent | Role |
|-------|------|
| `lead-crew` | Orchestrator |
| `prospect-researcher` | Web + Brave discovery |
| `lead-enricher` | Hunter email waterfall |
| `outreach-writer` | AI copy + sequence |
| `lead-delivery` | CSV export, Resend sync |

Invoke via `/lead-gen`.

## Required keys (.env.local)

| Key | Purpose |
|-----|---------|
| `BRAVE_API_KEY` | Web prospect discovery |
| `HUNTER_API_KEY` | Email find + verify |
| `OPENAI_API_KEY` | Personalized outreach |
| `RESEND_API_KEY` | Send sequences |
| Supabase keys | Store prospects + message log |

## Compliance

- CAN-SPAM: include unsubscribe path via Resend
- GDPR: business emails only, legitimate interest
- LinkedIn: manual connection requests; no scraping automation without user approval

## Related

- `outreach-sequencer` — sequence design and copy rules
- `brand-voice` — tone lock across campaigns
- `marketing-agent` — campaign angles before outreach
