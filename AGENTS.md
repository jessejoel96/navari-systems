<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo is a single Next.js 16 (App Router, Turbopack) marketing site for "Navari Systems". Standard commands live in `package.json` (`dev`, `build`, `start`, `lint`).

- **Run (dev):** `npm run dev` serves on `http://localhost:3000`.
- **Lint gotcha:** `npm run lint` lints the whole repo, including committed `.cursor/skills/` and `.agents/skills/` tooling files, which emit hundreds of pre-existing errors unrelated to the app. To lint only the project, run `npx eslint src` (currently clean).
- **Middleware env requirement (non-obvious):** `src/middleware.ts` runs on nearly every route and constructs a Supabase client with non-null `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. If those are missing, every page (even static ones) errors at runtime. In this environment they are provided via Cursor Secrets, so no `.env.local` is needed; if running elsewhere without them, set at least those two (any valid-format URL works to boot static pages).
- **External services:** Supabase (hosted Postgres; migrations in `supabase/migrations/`), Resend (email), and OpenAI are wired via injected secrets (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFICATION_EMAIL`, `OPENAI_API_KEY`). The `/audit` AI routes fall back to canned content when `OPENAI_API_KEY` is unset or set to `"missing"`. No local DB container exists.
