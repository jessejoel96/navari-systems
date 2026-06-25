import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env.js";
import type { FetchRunSummary, IcpConfig, Prospect } from "./types.js";

export function createLeadClient() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createFetchRun(icp: IcpConfig) {
  const supabase = createLeadClient();
  const { data, error } = await supabase
    .from("lead_fetch_runs")
    .insert({
      icp_name: icp.name,
      icp_config: icp,
      status: "running",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create fetch run: ${error.message}`);
  return data.id as string;
}

export async function completeFetchRun(runId: string, summary: FetchRunSummary, status: "completed" | "failed") {
  const supabase = createLeadClient();
  const { error } = await supabase
    .from("lead_fetch_runs")
    .update({
      status,
      summary,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) throw new Error(`Failed to update fetch run: ${error.message}`);
}

export async function saveProspects(runId: string, prospects: Prospect[]) {
  if (prospects.length === 0) return 0;

  const supabase = createLeadClient();
  const rows = prospects.map((p) => ({
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

  const withEmail = rows.filter((r) => r.email);
  const withoutEmail = rows.filter((r) => !r.email);

  let saved = 0;

  if (withEmail.length > 0) {
    const { error } = await supabase.from("outbound_prospects").upsert(withEmail, {
      onConflict: "email",
      ignoreDuplicates: false,
    });
    if (error) throw new Error(`Failed to save prospects: ${error.message}`);
    saved += withEmail.length;
  }

  if (withoutEmail.length > 0) {
    const { error } = await supabase.from("outbound_prospects").insert(withoutEmail);
    if (error && !error.message.includes("duplicate")) {
      throw new Error(`Failed to save prospects without email: ${error.message}`);
    }
    if (!error) saved += withoutEmail.length;
  }

  return saved;
}

export async function listUndeliveredHot(limit = 50) {
  const supabase = createLeadClient();
  const { data, error } = await supabase
    .from("outbound_prospects")
    .select("*")
    .in("icp_tier", ["hot", "warm"])
    .eq("delivery_status", "pending")
    .order("icp_score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list prospects: ${error.message}`);
  return data ?? [];
}

export async function markDelivered(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = createLeadClient();
  const { error } = await supabase
    .from("outbound_prospects")
    .update({ delivery_status: "delivered", delivered_at: new Date().toISOString() })
    .in("id", ids);

  if (error) throw new Error(`Failed to mark delivered: ${error.message}`);
}

export async function exportRunToCsv(runId: string): Promise<string> {
  const supabase = createLeadClient();
  const { data, error } = await supabase
    .from("outbound_prospects")
    .select("*")
    .eq("fetch_run_id", runId)
    .order("icp_score", { ascending: false });

  if (error) throw new Error(`Failed to export: ${error.message}`);

  const headers = [
    "full_name",
    "title",
    "email",
    "email_status",
    "company_name",
    "company_domain",
    "linkedin_url",
    "persona",
    "observation",
    "observation_source",
    "icp_score",
    "icp_tier",
    "location",
  ];

  const lines = [headers.join(",")];
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const raw = (r.raw as Record<string, unknown> | undefined) ?? {};
    lines.push(
      headers
        .map((h) => {
          let value = String(r[h] ?? "");
          if (!value && (h === "persona" || h === "observation" || h === "observation_source")) {
            value = String(raw[h] ?? "");
          }
          return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    );
  }

  return lines.join("\n");
}

export async function getProspectsForOutreach(tier: "hot" | "warm", limit: number) {
  const supabase = createLeadClient();
  const { data, error } = await supabase
    .from("outbound_prospects")
    .select("*")
    .eq("icp_tier", tier)
    .in("outreach_status", ["pending", "in_sequence"])
    .not("email", "is", null)
    .order("icp_score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list outreach prospects: ${error.message}`);
  return data ?? [];
}

export async function queueOutreachMessage(input: {
  prospect_id: string;
  sequence_name: string;
  step_index: number;
  subject: string;
  body: string;
  status: string;
}) {
  const supabase = createLeadClient();
  const { error } = await supabase.from("outreach_messages").insert({
    prospect_id: input.prospect_id,
    sequence_name: input.sequence_name,
    step_index: input.step_index,
    subject: input.subject,
    body: input.body,
    status: input.status,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(`Failed to queue message: ${error.message}`);
}

export async function markOutreachSent(prospectId: string, step: number) {
  const supabase = createLeadClient();
  const { error } = await supabase
    .from("outbound_prospects")
    .update({
      outreach_status: "in_sequence",
      outreach_step: step,
      last_contacted_at: new Date().toISOString(),
    })
    .eq("id", prospectId);
  if (error) throw new Error(`Failed to update outreach status: ${error.message}`);
}

export type PipelineStats = {
  hot: number;
  warm: number;
  cold: number;
  readyForOutreach: number;
  missingObservationHot: number;
  inSequence: number;
  contactedToday: number;
  pendingResearch: number;
};

function hasObservation(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const obs = (raw as Record<string, unknown>).observation;
  return typeof obs === "string" && obs.trim().length > 20;
}

export async function getOutboundPipelineStats(): Promise<PipelineStats> {
  const supabase = createLeadClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const countTier = async (tier: string) => {
    const { count, error } = await supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .eq("icp_tier", tier);
    if (error) throw new Error(`Count failed: ${error.message}`);
    return count ?? 0;
  };

  const [hot, warm, cold, inSequence, contactedToday, warmNoEmail] = await Promise.all([
    countTier("hot"),
    countTier("warm"),
    countTier("cold"),
    supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .in("outreach_status", ["in_sequence", "contacted"])
      .then(({ count, error }) => {
        if (error) throw new Error(`Count failed: ${error.message}`);
        return count ?? 0;
      }),
    supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .gte("last_contacted_at", todayStart.toISOString())
      .then(({ count, error }) => {
        if (error) throw new Error(`Count failed: ${error.message}`);
        return count ?? 0;
      }),
    supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .eq("icp_tier", "warm")
      .is("email", null)
      .then(({ count, error }) => {
        if (error) throw new Error(`Count failed: ${error.message}`);
        return count ?? 0;
      }),
  ]);

  const { data: hotWithEmail, error } = await supabase
    .from("outbound_prospects")
    .select("raw, outreach_status")
    .eq("icp_tier", "hot")
    .not("email", "is", null)
    .in("outreach_status", ["pending", "in_sequence"])
    .limit(300);

  if (error) throw new Error(`Failed to load hot prospects: ${error.message}`);

  const rows = hotWithEmail ?? [];
  const missingObservationHot = rows.filter((r) => !hasObservation(r.raw)).length;
  const readyForOutreach = rows.filter((r) => hasObservation(r.raw)).length;

  return {
    hot,
    warm,
    cold,
    readyForOutreach,
    missingObservationHot,
    inSequence,
    contactedToday,
    pendingResearch: warmNoEmail,
  };
}

export async function listRecentHotProspects(limit = 20) {
  const supabase = createLeadClient();
  const { data, error } = await supabase
    .from("outbound_prospects")
    .select(
      "id, full_name, title, company_name, email, icp_score, icp_tier, outreach_status, outreach_step, raw, last_contacted_at",
    )
    .eq("icp_tier", "hot")
    .order("icp_score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list recent hot prospects: ${error.message}`);
  return data ?? [];
}
