#!/usr/bin/env node
/**
 * Apply outbound Supabase migrations (006 + 007).
 * Requires DATABASE_URL or SUPABASE_DB_URL (direct Postgres connection string).
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import "../src/env.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const migrations = [
  resolve(root, "supabase/migrations/006_outbound_leads.sql"),
  resolve(root, "supabase/migrations/007_outreach_automation.sql"),
];

const grants = `
GRANT ALL ON TABLE public.lead_fetch_runs TO service_role;
GRANT ALL ON TABLE public.outbound_prospects TO service_role;
GRANT ALL ON TABLE public.outreach_messages TO service_role;
NOTIFY pgrst, 'reload schema';
`;

const connectionString =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DIRECT_URL;
if (!connectionString) {
  console.error(
    "Missing DATABASE_URL or SUPABASE_DB_URL.\n" +
      "Add your Supabase direct connection string to run migrations.\n" +
      "Dashboard → Project Settings → Database → Connection string (URI).",
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const path of migrations) {
    const sql = readFileSync(path, "utf8");
    console.log(`Applying ${path.split("/").pop()}...`);
    await client.query(sql);
    console.log("  OK");
  }
  console.log("Applying service_role grants + schema reload...");
  await client.query(grants);
  console.log("  OK");
  console.log("\nOutbound migrations applied successfully.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
