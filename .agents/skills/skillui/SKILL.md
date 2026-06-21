---
name: skillui
description: Extract a website's design system (colors, fonts, spacing, components, animations) via the SkillUI CLI and rebuild matching UI. Use when the user provides a URL to clone, reverse-engineer, or match a site's design, or mentions skillui.
---

# SkillUI — Clone Any Site's Design

SkillUI CLI is installed globally (`skillui`).

## Workflow

1. **Extract design from URL**

```bash
skillui --url https://example.com --mode ultra --out ./design-extracts --name "ExampleSite"
```

For basic extraction (no Playwright):

```bash
skillui --url https://example.com --out ./design-extracts
```

2. **Read the output** — folder contains `DESIGN.md`, `.skill` file, tokens, screenshots, and component fingerprints.
3. **Build matching UI** — use the extracted tokens and DESIGN.md as the single source of truth. Pair with `clone-ui` skill for pixel-faithful rebuilds.
4. **Ultra mode setup** (one-time, for full cinematic extraction):

```bash
npm install playwright
npx playwright install chromium
```

## Other modes

```bash
skillui --dir ./my-app          # scan local project
skillui --repo https://github.com/org/repo   # clone and scan repo
skillui --format design-md      # DESIGN.md only
```

## Flags

- `--mode ultra` — scroll journeys, keyframes, hover states, component fingerprints
- `--screens 10` — pages to crawl in ultra mode (default 5, max 20)
- `--name "BrandName"` — override project name in output folder

## Pair with clone-ui

After extraction, invoke the **clone-ui** skill to rebuild the page in the user's stack (React, Next.js, etc.) using the extracted design data.
