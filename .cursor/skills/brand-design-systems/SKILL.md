---
name: brand-design-systems
description: Apply real brand and style design systems from the Awesome Design Skills registry (67 systems with SKILL.md + DESIGN.md). Use when the user names a brand, style, or aesthetic (glassmorphism, material, linear, stripe, minimal, brutalism, etc.) or asks to pull colors, typography, and component rules from a design system.
---

# Brand Design Systems (Awesome Design MD)

Registry installed at `.agents/skills/awesome-design-skills-registry/` (67 design systems, each with `SKILL.md` + `DESIGN.md`).

## Workflow

1. **Pick a system** — ask the user which style/brand they want, or infer from context (SaaS → `application`, fintech → `enterprise`, creative → `expressive`, etc.).
2. **Load the skill** — read `.agents/skills/awesome-design-skills-registry/skills/<slug>/SKILL.md` and `.agents/skills/awesome-design-skills-registry/skills/<slug>/DESIGN.md`.
3. **Apply tokens** — use the skill's color palette, typography scale, spacing, and component rules when building UI. Do not invent generic AI defaults.
4. **Optional: pull into project** — run `npx typeui.sh pull <slug>` to copy the skill into `.cursor/skills/` for active use.

## Browse available systems

```bash
npx typeui.sh list
```

Preview all: https://typeui.sh/design-skills

## Common slugs

agentic, ant, application, bento, bold, brutalism, clean, corporate, dashboard, editorial, elegant, enterprise, glassmorphism, gradient, material, matrix, minimal, modern, neon, neobrutalism, premium, professional, retro, shadcn, sleek, vintage

Full list: `.agents/skills/awesome-design-skills-registry/skills/`

## Pair with other skills

Run **Impeccable** (`/impeccable layout`, `/impeccable polish`) after applying a brand system for spacing and final polish.
