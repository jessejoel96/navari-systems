---
description: Discover, enrich, and run personalized outbound for Navari — no Apollo required. Web discovery, Hunter emails, AI copy, Resend sequences.
allowed_tools: ["Read", "Grep", "Glob", "Shell", "Write"]
---

# /lead-gen

Outbound lead system for navari.systems — find leads and execute personalized outreach with AI and automation.

## Usage

```
/lead-gen                              # Full pipeline overview
/lead-gen icp                          # Refine ICP before running
/lead-gen fetch [--limit 25]           # Web discovery → enrich → Supabase
/lead-gen fetch --dry-run              # Preview without saving
/lead-gen outreach [--tier hot]        # AI-personalized email (preview with --dry-run)
/lead-gen deliver                      # Export hot/warm CSV
```

## Pipeline (no Apollo)

```
Brave web search → parse LinkedIn + companies → Hunter emails → ICP score
→ Supabase → OpenAI personalization → Resend 3-touch sequence
```

## Prerequisites (.env.local)

- `BRAVE_API_KEY` — discovery
- `HUNTER_API_KEY` — emails
- `OPENAI_API_KEY` — personalization
- `RESEND_API_KEY` — sending
- Supabase keys

## Agent network

| Agent | Role |
|-------|------|
| `lead-crew` | Orchestrator |
| `prospect-researcher` | Web discovery |
| `lead-enricher` | Hunter waterfall |
| `outreach-writer` | AI sequences |
| `lead-delivery` | Export + handoff |

Skills: `lead-intelligence`, `outreach-sequencer`, `brand-voice`

## Examples

```
/lead-gen fetch 30 US professional services founders
```

```
/lead-gen outreach --dry-run for top 5 hot leads
```

```
/lead-gen icp for mortgage brokers — then fetch
```

---

*Navari outbound — discover + personalize + automate*
