# Outbound Lead Gen — Project Spec

**Owner:** Navari Systems  
**Site:** [navari.systems](https://navari.systems)  
**Status:** Active — MVP pipeline built, enrichment substitutes in progress  
**Goal:** Find B2B leads and execute personalized outreach at scale with AI and automation — **without Apollo, Clearbit, or Proxycurl**

---

## Summary

Apollo-like outcomes from an owned stack:

| Capability | Approach |
|------------|----------|
| Find prospects | Web + neural search (Brave, Exa, Tavily) |
| Enrich contacts | Hunter.io email waterfall |
| Company intel | Firecrawl + Exa Content + Tavily signals |
| Score fit | ICP rubric + buying signals (planned) |
| Personalize | OpenAI per-prospect copy |
| Send sequences | Resend 3-touch automation |
| Store & deliver | Supabase + CSV export |

**Implementation:** `tools/lead-gen/`  
**Agents & skills:** `.cursor/agents/ecc-lead-*.md`, `.cursor/.agents/skills/lead-intelligence/`  
**Cursor command:** `/lead-gen`

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         CURSOR AGENT NETWORK                              │
│  lead-crew → prospect-researcher → lead-enricher → outreach-writer       │
│              → lead-delivery                                              │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────┐
│ DISCOVER          ENRICH           SCORE           OUTREACH               │
│ Brave Search  →   Hunter find  →   ICP rubric  →   OpenAI personalize  │
│ Exa people/co     Hunter verify     hot/warm/cold    Resend send         │
│ Tavily signals    Firecrawl team*   signals*         3-touch sequence   │
│ Exa Content*      Snov (optional)*                                        │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │ Supabase        │
                          │ outbound_       │
                          │ prospects       │
                          │ outreach_       │
                          │ messages        │
                          └────────┬────────┘
                                   │
                          CSV / Resend / CRM handoff
```

\* Planned or agent-assisted via MCP — not yet wired in CLI

---

## Pipeline phases

### Phase 1 — ICP lock

Define who Navari sells to. Default config: `tools/lead-gen/icp.navari.json`.

| Field | Default |
|-------|---------|
| Titles | Founder, CEO, COO, Operations Director |
| Industries | Professional services, real estate, law, financial, marketing, e-learning |
| Company size | 11–200 employees |
| Geos | US, UK, Canada, Australia |
| Discovery | `discovery_provider: "web"` (no Apollo) |

Custom campaigns: copy to `icp.<campaign>.json` and pass `--icp`.

### Phase 2 — Discover

Build prospect list from open sources.

| Source | Role | Package / cost |
|--------|------|----------------|
| **Brave Search API** | Keyword + LinkedIn URL discovery | API key |
| **Exa Search** | Semantic people + company search | Free tier (20k req/mo) |
| **Tavily MCP** | News, hiring, funding signals | Installed |
| **Firecrawl MCP** | Team/about page parsing | In mcp-configs |

**Exa recommendation:** Start on **Free Search**. Add **Content** ($1/1k pages) for team pages. Use **Deep Search** for weekly campaign research only. Trial **Agent** for bulk list builds (beta).

### Phase 3 — Enrich

Email waterfall (no invented addresses):

```
Hunter name + domain → Hunter domain roster → Hunter verify
(Optional: Snov.io as second source)
```

### Phase 4 — Score

| Tier | Score | Criteria |
|------|-------|----------|
| hot | ≥75 | Decision-maker + verified email + ICP industry |
| warm | ≥55 | Good title or company fit |
| cold | <55 | Weak fit or missing data |

**Planned:** Tavily hiring/funding signals, engagement history, dedup by email hash.

### Phase 5 — Personalize & send

- Sequence: `tools/lead-gen/sequences/navari-intro-3.json`
- Copy: OpenAI + `brand-voice` (fallback templates if no key)
- Send: Resend (`RESEND_FROM_EMAIL`)
- Log: `outreach_messages` table

### Phase 6 — Deliver

- Hot/warm CSV → `tools/lead-gen/reports/`
- Resend contact sync → `src/lib/resend/contacts.ts`
- Hostinger Reach MCP (optional segments)

---

## Substitutes (Clearbit / Proxycurl unavailable)

**Proceed without them.** Use:

| Apollo-style data | Substitute |
|-------------------|------------|
| Firmographics | Exa company research + Firecrawl `/about` |
| Employee count | Parse team/about pages (Firecrawl / Exa Content) |
| LinkedIn profiles | Exa `people_search_exa` (not full profile API) |
| Tech stack | Firecrawl scrape + keyword hints |
| Funding / signals | Tavily news search |
| Email accuracy | Hunter verify (primary quality gate) |

Expected quality vs Apollo database: **~75–80%** at zero incremental data-vendor cost.

---

## Agent network

| Agent | File | Responsibility |
|-------|------|----------------|
| `lead-crew` | `.cursor/agents/ecc-lead-crew.md` | Orchestrate full pipeline |
| `prospect-researcher` | `.cursor/agents/ecc-prospect-researcher.md` | Web + Exa + Tavily discovery |
| `lead-enricher` | `.cursor/agents/ecc-lead-enricher.md` | Hunter waterfall |
| `outreach-writer` | `.cursor/agents/ecc-outreach-writer.md` | AI sequences |
| `lead-delivery` | `.cursor/agents/ecc-lead-delivery.md` | Export, logging, handoff |

### Skills

| Skill | Path |
|-------|------|
| `lead-intelligence` | `.cursor/.agents/skills/lead-intelligence/SKILL.md` |
| `outreach-sequencer` | `.cursor/.agents/skills/outreach-sequencer/SKILL.md` |
| `brand-voice` | `.cursor/.agents/skills/brand-voice/SKILL.md` |
| `exa-search` | `.cursor/.agents/skills/exa-search/SKILL.md` |
| `deep-research` | `.cursor/.agents/skills/deep-research/SKILL.md` |
| `market-research` | `.cursor/.agents/skills/market-research/SKILL.md` |

---

## Data model (Supabase)

Migrations:

- `supabase/migrations/006_outbound_leads.sql` — `lead_fetch_runs`, `outbound_prospects`
- `supabase/migrations/007_outreach_automation.sql` — outreach columns, `outreach_messages`

Key tables:

| Table | Purpose |
|-------|---------|
| `lead_fetch_runs` | ICP snapshot, status, summary JSON |
| `outbound_prospects` | Contacts, scores, outreach state |
| `outreach_messages` | Sent subject/body per step |

Related inbound table: `audit_leads` — future nurture bridge for ICP-matching audit submitters.

---

## Environment

Add to repo root `.env.local`:

```env
# Discovery
BRAVE_API_KEY=
EXA_API_KEY=

# Enrichment
HUNTER_API_KEY=

# Personalization + send
OPENAI_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=Navari Systems <jessejoel@navari.systems>

# Storage
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
RESEND_SEGMENT_ID=
LEAD_FETCH_SECRET=
```

See `.env.example` for full list.

### MCP servers

| MCP | Purpose | Config |
|-----|---------|--------|
| `brave-search` | Web discovery | `.cursor/mcp.json` |
| `tavily-remote-mcp` | Signals, research | User-level |
| `exa-web-search` | People/company search | `.cursor/mcp-configs/mcp-servers.json` |
| `firecrawl` | Page scrape | `.cursor/mcp-configs/mcp-servers.json` |
| `supabase` | DB ops | `.cursor/mcp.json` |
| `hostinger-reach` | Email segments | `.cursor/mcp.json` |

---

## Commands

From repo root:

```bash
npm install --prefix tools/lead-gen

npm run lead:fetch:dry      # Preview discovery (no save)
npm run lead:fetch          # Discover → enrich → score → Supabase
npm run lead:outreach:dry   # Preview AI emails
npm run lead:outreach       # Send step 1 to hot leads
npm run lead:deliver        # Export hot/warm CSV
npm run lead:export -- <run-id>
```

Custom ICP:

```bash
npm run lead:fetch -- --icp tools/lead-gen/icp.custom.json --limit 30
```

Cursor:

```
/lead-gen fetch for UK professional services founders
/lead-gen outreach --dry-run
```

---

## File map

```
projects/outbound-lead-gen/
  PROJECT.md              ← this file

tools/lead-gen/
  README.md               ← operator quick start
  icp.navari.json         ← default ICP
  sequences/              ← email cadences
  src/                    ← CLI pipeline
  reports/                ← CSV exports (gitignored)

.cursor/
  commands/lead-gen.md
  agents/ecc-lead-*.md
  .agents/skills/lead-intelligence/
  .agents/skills/outreach-sequencer/

supabase/migrations/
  006_outbound_leads.sql
  007_outreach_automation.sql
```

---

## Build status

| Component | Status |
|-----------|--------|
| CLI fetch (Brave web) | ✅ Built |
| Hunter enrichment | ✅ Built |
| ICP scoring | ✅ Built |
| Supabase storage | ✅ Built |
| AI outreach + Resend | ✅ Built |
| 3-touch sequence | ✅ Built |
| Agent network + `/lead-gen` | ✅ Built |
| Exa discovery in CLI | ⬜ Planned |
| Tavily buying signals | ⬜ Planned |
| Firecrawl team parse | ⬜ Planned |
| Snov.io waterfall backup | ⬜ Optional |
| Inbound `audit_leads` → nurture | ⬜ Planned |
| Admin dashboard UI | ⬜ Future |

---

## Quality & compliance

- **CAN-SPAM:** Business emails only; Resend unsubscribe handling
- **GDPR:** Legitimate interest; no personal consumer emails
- **LinkedIn:** Manual connection requests unless user approves automation
- **Rate limits:** Respect Brave/Hunter/Exa quotas; always `--dry-run` first
- **Never invent emails** — API results only

---

## Roadmap

### Now (proceed without Clearbit/Proxycurl)

1. Add `EXA_API_KEY` and enable `exa-web-search` MCP
2. Wire Exa + Tavily into `tools/lead-gen` discovery
3. Add Firecrawl team-page parser before Hunter
4. Run first production fetch + outreach dry-run

### Next

5. Buying-signal scoring (Tavily hiring/funding)
6. Deduplication + reply tracking
7. Bridge hot `audit_leads` into outbound nurture
8. Vertical ICP files (law, mortgage, real estate from `src/lib/workflows.ts`)

### Later

9. `/dashboard/leads` admin UI in navari-systems
10. Cron or Vercel scheduled fetch (protect with `LEAD_FETCH_SECRET`)
11. A/B subject lines from outreach performance data

---

## Navari buyer context

From `src/lib/constants.ts` and `src/lib/workflows.ts`:

- **Buyer:** Business owners doing $15k+/month losing time to manual processes
- **Offer:** Map 3 costliest manual workflows → automate at fixed price/timeline
- **Pain hooks by vertical:** non-billable intake (law), slow lead response (mortgage), scattered ops (professional services)

Use these angles in `outreach-writer` personalization.

---

## References

- Operator docs: `tools/lead-gen/README.md`
- Exa MCP skill: `.cursor/.agents/skills/exa-search/SKILL.md`
- Open-source references: [Signal](https://github.com/jay-sahnan/signal), [revenue-os](https://github.com/personizeai/revenue-os), [opengtm](https://github.com/buildingopen/opengtm)
