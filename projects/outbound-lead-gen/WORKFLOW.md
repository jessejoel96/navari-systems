# Outbound Lead Gen — Runbook

Quick operational guide. Full spec: [PROJECT.md](./PROJECT.md)

## First-time setup

1. Copy env vars from `config.example.env` into repo root `.env.local`
2. Apply Supabase migrations `006` and `007`
3. `npm install --prefix tools/lead-gen`
4. Enable MCPs: Brave (active), Tavily (user), Exa + Firecrawl (from mcp-configs)
5. Get keys: [Brave Search API](https://brave.com/search/api/), [Hunter](https://hunter.io/api-keys), [Exa](https://exa.ai)

## Standard weekly run

```bash
# 1. Preview discovery
npm run lead:fetch:dry

# 2. Save batch
npm run lead:fetch

# 3. Review hot leads in Supabase (outbound_prospects)

# 4. Preview emails
npm run lead:outreach:dry

# 5. Send (user approval required)
npm run lead:outreach -- --tier hot --limit 10

# 6. Export for CRM
npm run lead:deliver
```

## Cursor agent run

```
/lead-gen icp — refine for [vertical]
/lead-gen fetch --limit 25
/lead-gen outreach --dry-run
```

Delegate to: `lead-crew` → `prospect-researcher` → `lead-enricher` → `outreach-writer` → `lead-delivery`

## Troubleshooting

| Error | Fix |
|-------|-----|
| `BRAVE_API_KEY is required` | Add key to `.env.local` |
| `HUNTER_API_KEY` missing | Enrichment skips; add for emails |
| No emails found | Run Firecrawl on company `/team` via agent; widen ICP |
| Resend send fails | Check `RESEND_FROM_EMAIL` domain verified |
| Duplicate prospects | Expected — upsert on email in Supabase |

## What we skip (by design)

- Apollo database
- Clearbit enrichment
- Proxycurl LinkedIn API

Substitutes: Exa + Firecrawl + Tavily + Hunter (see PROJECT.md)
