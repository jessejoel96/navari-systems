# Layer One Client Acquisition — Observation-Based Outreach

**This is the only cold outreach method for Navari Systems.**  
All agents, skills, sequences, and CLI personalization must follow this — not generic cold pitching.

---

## The rule

> Identify a business in your target category → spend **15 minutes** studying their online presence → find **one specific problem** your offer solves that is **visible today** → contact them with that observation and a **low-friction next step**.

**Not:** compliments, feature lists, "I help companies like yours," or "hire me."  
**Yes:** proof you looked, cost of the problem, offer to share findings.

---

## Pre-outreach research (15 minutes)

`prospect-researcher` and humans must complete before `outreach-writer` drafts touch 1.

| Step | Action | Output |
|------|--------|--------|
| 1 | Open website, contact flow, careers/jobs page | Screenshot notes |
| 2 | Check LinkedIn company + decision-maker | Role + recent posts |
| 3 | Trace one client journey (lead → follow-up → delivery) | Where it breaks |
| 4 | Optional: job boards for manual-hire signals | Trigger message angle |
| 5 | Write **one sentence observation** — specific, falsifiable | `observation` field |

Store in prospect record:
```json
{
  "observation": "I noticed …",
  "observation_source": "website contact flow / LinkedIn jobs / …",
  "persona": "The Stretched Partner"
}
```

**Gate:** No observation → no touch 1. Queue for research or skip.

---

## Message structure (every touch 1)

### 1. Opening — specific observation

Demonstrates you actually looked. **Not a compliment.**

```
I noticed [specific visible fact about their ops/marketing/stack/client journey].
```

**Bad:** "I love what you're doing at Acme Legal."  
**Good:** "I noticed your website ranks for your firm name but not for any of the search terms potential clients would use when comparing solicitors in [city]."

### 2. Bridge — what it costs them

One or two sentences. Quantify when possible.

```
This means [concrete consequence — lost leads, billable hours, delayed cash, competitor advantage].
```

**Example:** "This means people actively looking for what you offer are finding competitors instead."

### 3. Offer — low-friction next step

Never "hire me" in touch 1. Offer **value first**.

```
I mapped out [N] specific changes that would shift this within 60 days.
Would it be useful if I sent you what I found?
```

Alternative CTAs:
- "Worth a 20-minute look?" (job-board trigger outreach)
- "Happy to send the three-process map — no pitch on the first note."

---

## Sequence logic (`navari-intro-3`)

| Step | Day | Purpose | Method |
|------|-----|---------|--------|
| 1 | 0 | Observation + bridge + value offer | Full 3-part structure |
| 2 | 3 | Add one proof point or industry insight | Still no hard pitch |
| 3 | 5 | Final bump — restate offer to send findings | Graceful close |

Follow-ups **never** repeat touch 1 verbatim. They reference the original observation or add one new data point.

---

## Job board trigger outreach

When a company posts for manual roles, use this pattern:

```
I noticed [Company] is hiring for [role from posting] to manage [task from posting].

I build automation systems that handle this without the ongoing headcount cost —
most clients see the system pay for itself within 6–8 weeks versus a salaried hire.

Worth a 20-minute look?
```

---

## Copy constraints

| Rule | Limit |
|------|-------|
| Touch 1 length | ≤120 words |
| Follow-ups | ≤90 words |
| CTAs per email | 1 |
| Sign-off | Jesse, Navari Systems |
| Title in signature block | AI Automation Specialist (not Founder in cold outreach) |
| Banned openers | "I hope this finds you well", "I wanted to reach out", "Synergy", "Leverage" |
| Tone | Problem-first, systems thinking — see `brand-voice` skill |

**Subject lines:** Specific > clever. Prefer observation fragment or cost hook.  
Examples from slogan library: *"What costs you 10 hours a week…"* · *"The system you needed two years ago"*

---

## CLI & automation

`personalize.ts` uses this method when `OPENAI_API_KEY` is set.  
If `prospect.observation` is populated, it **must** appear in touch 1 opening.  
If missing, fallback templates use industry persona patterns from `BUYER-PERSONAS.md` — flag as `[NEEDS RESEARCH]` in dry-run output.

```bash
npm run lead:outreach:dry   # Review observation quality before send
npm run lead:outreach       # Live send — user approval required
```

---

## Agent responsibilities

| Agent | Observation method duty |
|-------|-------------------------|
| `prospect-researcher` | 15-min research + document observation before handoff |
| `lead-enricher` | Preserve observation fields; don't overwrite |
| `outreach-writer` | Enforce 3-part structure; reject generic drafts |
| `lead-crew` | Block batch send if >20% missing observations |
| `lead-delivery` | CSV includes `observation` column for CRM |

---

## Related docs

- [BUYER-PERSONAS.md](./BUYER-PERSONAS.md) — who to target
- [PROJECT.md](./PROJECT.md) — pipeline architecture
- `navari-systems-insights.md` — full strategy master doc
