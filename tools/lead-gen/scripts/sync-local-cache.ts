#!/usr/bin/env node
/**
 * Push local .cache prospects to Supabase (no new discovery API calls).
 * Requires outbound migrations applied and Supabase keys in env.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import "../src/env.js";
import { requireEnv } from "../src/env.js";
import type { IcpConfig, Prospect } from "../src/types.js";

const cacheDir = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache");
const prospectsPath = resolve(cacheDir, "local-prospects.json");
const icpPath = resolve(dirname(fileURLToPath(import.meta.url)), "../icp.navari.json");

if (!existsSync(prospectsPath)) {
  console.error("No local cache found at", prospectsPath);
  process.exit(1);
}

type LocalRow = Prospect & {
  id: string;
  fetch_run_id: string;
  observation?: string;
  observation_source?: string;
  persona?: string;
};

const rows = JSON.parse(readFileSync(prospectsPath, "utf8")) as LocalRow[];
const icp = JSON.parse(readFileSync(icpPath, "utf8")) as IcpConfig;

// Dedupe by linkedin_url or email before sync
const seen = new Set<string>();
const uniqueRows = rows.filter((row) => {
  const key = row.email ?? row.linkedin_url ?? row.id;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? requireEnv("SUPABASE_URL");
const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Verify tables exist
const { error: probeError } = await supabase.from("lead_fetch_runs").select("id").limit(1);
if (probeError?.message.includes("Could not find the table")) {
  console.error(
    "Supabase outbound tables not found. Run migrations first:\n" +
      "  npm run lead:setup-db   (requires DATABASE_URL)\n" +
      "  or paste tools/lead-gen/scripts/apply-outbound-sql.sql in Supabase SQL Editor",
  );
  process.exit(1);
}
if (probeError) throw new Error(probeError.message);

const { data: runRow, error: runError } = await supabase
  .from("lead_fetch_runs")
  .insert({ icp_name: icp.name, icp_config: icp, status: "running" })
  .select("id")
  .single();
if (runError) throw new Error(`Failed to create fetch run: ${runError.message}`);
const runId = runRow.id as string;

const prospects: Prospect[] = uniqueRows.map((row) => ({
  apollo_id: row.apollo_id,
  first_name: row.first_name,
  last_name: row.last_name,
  full_name: row.full_name,
  title: row.title,
  email: row.email,
  email_status: row.email_status,
  linkedin_url: row.linkedin_url,
  company_name: row.company_name,
  company_domain: row.company_domain,
  company_industry: row.company_industry,
  company_size: row.company_size,
  location: row.location,
  icp_score: row.icp_score,
  icp_tier: row.icp_tier,
  source: row.source,
  observation: row.observation,
  observation_source: row.observation_source,
  persona: row.persona,
  raw: row.raw,
}));

const dbRows = prospects.map((p) => ({
  fetch_run_id: runId,
  apollo_id: p.apollo_id,
  first_name: p.first_name,
  last_name: p.last_name,
  full_name: p.full_name,
  title: p.title,
  email: p.email,
  email_status: p.email_status,
  linkedin_url: p.linkedin_url,
  company_name: p.company_name,
  company_domain: p.company_domain,
  company_industry: p.company_industry,
  company_size: p.company_size,
  location: p.location,
  icp_score: p.icp_score,
  icp_tier: p.icp_tier,
  source: p.source,
  raw: p.raw,
  delivery_status: "pending",
  outreach_status: "pending",
  outreach_step: 0,
}));

const withEmail = dbRows.filter((r) => r.email);
const withoutEmail = dbRows.filter((r) => !r.email);
let saved = 0;

if (withEmail.length > 0) {
  const { error } = await supabase.from("outbound_prospects").upsert(withEmail, { onConflict: "email" });
  if (error) throw new Error(`Upsert failed: ${error.message}`);
  saved += withEmail.length;
}
if (withoutEmail.length > 0) {
  const { error } = await supabase.from("outbound_prospects").insert(withoutEmail);
  if (error && !error.message.includes("duplicate")) throw new Error(`Insert failed: ${error.message}`);
  if (!error) saved += withoutEmail.length;
}

const hot = prospects.filter((p) => p.icp_tier === "hot").length;
const warm = prospects.filter((p) => p.icp_tier === "warm").length;
const cold = prospects.filter((p) => p.icp_tier === "cold").length;

const summary = {
  run_id: runId,
  icp_name: icp.name,
  provider: "local-cache-sync",
  searched: prospects.length,
  enriched: prospects.filter((p) => p.email).length,
  verified: prospects.filter((p) => p.email_status === "valid" || p.email_status === "verified").length,
  saved,
  hot,
  warm,
  cold,
};

const { error: completeError } = await supabase
  .from("lead_fetch_runs")
  .update({ status: "completed", summary, completed_at: new Date().toISOString() })
  .eq("id", runId);
if (completeError) throw new Error(`Failed to complete run: ${completeError.message}`);

console.log(`Synced ${saved}/${prospects.length} unique prospects to Supabase (run ${runId}).`);
console.log(`Tiers: ${hot} hot / ${warm} warm / ${cold} cold`);
if (uniqueRows.length < rows.length) {
  console.log(`Deduped ${rows.length - uniqueRows.length} duplicate rows from local cache.`);
}
