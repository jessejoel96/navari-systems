/**
 * GET  /api/cash-requests/cycles        — list all cycles
 * POST /api/cash-requests/cycles        — create new cycle for a given month/year
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("cash_request_cycles")
    .select(`
      *,
      cash_requests(
        id, entity_id, status, amount_requested, amount_approved,
        submission_received_at,
        entities(name, code, contact_email, contact_name)
      )
    `)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  const month: number = body.month ?? new Date().getMonth() + 1;
  const year: number = body.year ?? new Date().getFullYear();
  const deadlineDay: number = body.deadline_day ?? 28;

  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  const deadlineDate = `${year}-${String(month).padStart(2, "0")}-${String(deadlineDay).padStart(2, "0")}`;

  // Check if already exists
  const { data: existing } = await supabase
    .from("cash_request_cycles")
    .select("id")
    .eq("period_month", month)
    .eq("period_year", year)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Cycle already exists for this period" }, { status: 409 });
  }

  const { data: cycle, error: cycleErr } = await supabase
    .from("cash_request_cycles")
    .insert({ period_month: month, period_year: year, label, deadline_date: deadlineDate, status: "draft" })
    .select("id")
    .single();

  if (cycleErr) return NextResponse.json({ error: cycleErr.message }, { status: 500 });

  // Create one cash_request record per non-HQ entity
  const { data: entities } = await supabase
    .from("entities")
    .select("id, code")
    .eq("is_hq", false);

  if (entities && entities.length > 0) {
    await supabase.from("cash_requests").insert(
      entities.map((e: { id: string; code: string }) => ({
        cycle_id: cycle.id,
        entity_id: e.id,
        regional_office: e.code,
        period: label,
        amount_requested: 0,
        status: "pending",
      }))
    );
  }

  return NextResponse.json({ ok: true, cycle_id: cycle.id, label, deadline_date: deadlineDate });
}
