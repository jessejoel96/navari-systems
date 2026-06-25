#!/usr/bin/env node
/**
 * Apply Layer One observations to prospects (local cache or Supabase).
 * Usage: tsx scripts/apply-research.ts [path/to/research.json]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "../src/env.js";
import { updateLocalProspectObservation } from "../src/local-store.js";
import { updateProspectObservation } from "../src/supabase.js";

type ResearchEntry = {
  id?: string;
  company?: string;
  observation: string;
  observation_source: string;
  persona?: string;
};

const defaultPath = resolve(dirname(fileURLToPath(import.meta.url)), "research-batch.json");
const inputPath = process.argv[2] ? resolve(process.argv[2]) : defaultPath;

if (!existsSync(inputPath)) {
  console.error(`Research file not found: ${inputPath}`);
  process.exit(1);
}

const entries = JSON.parse(readFileSync(inputPath, "utf8")) as ResearchEntry[];
let applied = 0;
let failed = 0;

for (const entry of entries) {
  if (!entry.observation?.trim() || !entry.observation_source?.trim()) {
    console.warn("Skipping entry missing observation or source:", entry.company ?? entry.id);
    failed++;
    continue;
  }

  try {
    if (entry.id) {
      const local = updateLocalProspectObservation(
        entry.id,
        entry.observation,
        entry.observation_source,
        entry.persona,
      );
      if (local) {
        console.log(`✓ ${local.full_name?.trim() ?? local.company_name} → ${local.icp_tier} (${local.icp_score})`);
        applied++;
        continue;
      }
      await updateProspectObservation(entry.id, entry.observation, entry.observation_source, entry.persona);
      console.log(`✓ Supabase ${entry.id.slice(0, 8)}…`);
      applied++;
      continue;
    }

    console.warn("Skipping entry without id:", entry.company);
    failed++;
  } catch (error) {
    console.error(`✗ ${entry.company ?? entry.id}:`, error instanceof Error ? error.message : error);
    failed++;
  }
}

console.log(`\nApplied ${applied} observations (${failed} skipped/failed).`);
