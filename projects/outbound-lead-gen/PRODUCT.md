# Outbound Lead Gen — Product

**Register:** app UI (internal ops dashboard) + CLI automation  
**User:** Jesse — daily outbound operator for Navari Systems  
**Goal:** Run Layer One observation-based outreach without blowing free-tier API budgets

## Problem

Discovery and enrichment span Exa, Brave, Apollo (50 enrich credits/mo on free), Hunter, Snov, OpenAI, and Resend. Without a daily budget view, it's easy to burn Apollo credits or run redundant fetches.

## Solution

1. **Credit budget tracker** — monthly + daily caps, persisted usage, hard gates before paid operations  
2. **`lead:status` / `lead:daily`** — CLI morning overview + gated daily run  
3. **`/lead-daily` command + agents** — orchestrate research → dry-run → fetch → outreach within limits  
4. **`/outbound` dashboard** — Apollo-style pipeline layout (Navari navy/gold), credit meters, queue stats

## Success metrics

- Apollo enrich never exceeds configured monthly/daily cap without explicit override  
- Daily session starts with one command showing remaining budget + recommended actions  
- Hot leads missing observations flagged before send

## Not in scope (v1)

- Full Apollo UI clone or third-party branding  
- Auto-send without dry-run approval  
- Multi-user auth (secret-gated `/outbound` only)
