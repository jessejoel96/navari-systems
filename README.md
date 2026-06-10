# Navari Systems

AI Automation & Workflow Systems — marketing site for [navari.systems](https://navari.systems).

## Stack

- **Next.js 16** (App Router, standalone output)
- **Tailwind CSS v4** + Navari design tokens
- **Framer Motion** scroll animations
- **Supabase** — contact submissions + newsletter subscribers
- **Resend** — transactional email
- **MDX** blog (`content/blog/`)

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Supabase + Resend credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example`. Required for forms:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NOTIFICATION_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

## Database

Run `supabase/migrations/001_initial.sql` in your Supabase SQL editor.

## Production (Hostinger Business)

See [HOSTINGER.md](./HOSTINGER.md) for GitHub deploy and env var setup.

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page (11 sections) |
| `/blog` | MDX blog with industry filters |
| `/blog/[slug]` | Individual post |
| `/insights` | YouTube video hub |
| `/api/contact` | Contact form handler |
| `/api/newsletter` | Newsletter signup |
