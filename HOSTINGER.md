# Deploying Navari Systems on Hostinger Business Plan

Production host: **Hostinger Node.js Web Apps** (Business or Cloud).

Supabase and Resend remain external services — only the Next.js app runs on Hostinger.

## Prerequisites

- Hostinger **Business** or **Cloud** plan with Node.js app support
- GitHub repo pushed (`navari-systems`)
- Supabase project with `supabase/migrations/001_initial.sql` applied
- Resend account with `navari.systems` domain verified (SPF/DKIM in Hostinger DNS)
- Google Workspace MX records preserved for `jesse@navari.systems`

---

## Method A — GitHub auto-deploy (recommended)

### 1. Create Node.js app in hPanel

1. **Websites** → **Add Website** → **Node.js Web App**
2. Connect your GitHub account and select the `navari-systems` repository
3. Branch: `main`
4. Framework: **Next.js** (auto-detected)

### 2. Build settings

| Setting | Value |
|---------|-------|
| Node version | **20.x** (LTS) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start -- -p $PORT` |
| Root directory | `/` (repo root) |

### 3. Environment variables

Set in hPanel → Node.js app → Environment:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=Navari Systems <jesse@navari.systems>
NOTIFICATION_EMAIL=jesse@navari.systems
NEXT_PUBLIC_SITE_URL=https://navari.systems
NODE_ENV=production
```

Never commit real keys. Copy from `.env.example`.

### 4. Domain and SSL

1. Assign `navari.systems` to the Node.js app in hPanel
2. Enable SSL (automatic via Hostinger)
3. Add `www` → apex redirect if desired

### 5. DNS records (Hostinger DNS zone)

Keep existing records and add Resend verification:

| Type | Purpose |
|------|---------|
| MX | Google Workspace — **do not remove** |
| TXT | Resend SPF (per Resend dashboard) |
| CNAME | Resend DKIM (per Resend dashboard) |

### 6. Server region

Select **North America** (or nearest to your primary audience: UK, USA, Canada, Australia).

---

## Method B — Standalone upload (manual)

Use if GitHub connect is unavailable. `next.config.ts` sets `output: "standalone"`.

```bash
npm ci
npm run build
```

Copy to Hostinger:

- `.next/standalone/` (entire folder)
- `.next/static/` → `.next/standalone/.next/static/`
- `public/` → `.next/standalone/public/`
- `content/blog/` → `.next/standalone/content/blog/`

Start command (from standalone directory):

```bash
node server.js
```

Hostinger sets `PORT` automatically.

---

## Supabase migration

Run in Supabase SQL editor:

```sql
-- Contents of supabase/migrations/001_initial.sql
```

Tables: `contact_submissions`, `newsletter_subscribers` (RLS enabled, no public policies).

---

## Post-deploy smoke tests

- [ ] Homepage — all 11 sections load
- [ ] Mobile nav drawer works
- [ ] `/blog` — 3 seed posts visible
- [ ] `/insights` — empty state + newsletter form
- [ ] Contact form → row in Supabase + Resend emails (notify + auto-reply)
- [ ] Newsletter signup → Supabase row + welcome email
- [ ] `https://navari.systems/sitemap.xml` responds
- [ ] `https://navari.systems/robots.txt` responds
- [ ] SSL active (padlock in browser)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Hostinger | Check Node 20.x; run `npm run build` locally first |
| 502 on start | Confirm start command uses `$PORT`; check runtime logs in hPanel |
| Blog posts 404 in prod | Ensure `content/blog/` is in repo (GitHub deploy includes it) |
| API 500 on forms | Verify Supabase + Resend env vars; check app logs |
| Emails not sending | Confirm Resend domain verified; SPF/DKIM in DNS |
| Email to jesse@ broken | Do not overwrite Google Workspace MX records |

## Updates

**GitHub deploy:** push to `main` → Hostinger rebuilds automatically.

**Manual deploy:** rebuild locally, re-upload standalone folder, restart app in hPanel.
