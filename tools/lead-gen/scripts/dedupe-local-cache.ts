#!/usr/bin/env node
/** Deduplicate local-prospects.json by email or linkedin_url (keeps highest score). */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const prospectsPath = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache/local-prospects.json");
if (!existsSync(prospectsPath)) {
  console.error("No local cache found.");
  process.exit(1);
}

type Row = { id: string; email?: string; linkedin_url?: string; icp_score: number };
const rows = JSON.parse(readFileSync(prospectsPath, "utf8")) as Row[];

const best = new Map<string, Row>();
for (const row of rows) {
  const key = row.email ?? row.linkedin_url ?? row.id;
  const prev = best.get(key);
  if (!prev || row.icp_score > prev.icp_score) best.set(key, row);
}

const deduped = [...best.values()];
writeFileSync(prospectsPath, JSON.stringify(deduped, null, 2));
console.log(`Deduped ${rows.length} → ${deduped.length} prospects.`);
