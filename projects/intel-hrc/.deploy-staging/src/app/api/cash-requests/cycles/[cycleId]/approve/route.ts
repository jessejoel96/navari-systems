/**
 * POST /api/cash-requests/cycles/[cycleId]/approve
 * CFO/CEO confirms approval of all cash requests in a cycle.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const body = await req.json().catch(() => ({})) as { action?: string; approved_by?: string };
  const action = body.action ?? "approve";
  const approvedBy = body.approved_by ?? "CFO";

  const supabase = createServiceClient();

  const { data: cycle } = await supabase
    .from("cash_request_cycles")
    .select("id, status")
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

  if (action === "approve") {
    await supabase
      .from("cash_request_cycles")
      .update({
        status: "approved",
        cfo_approved_at: new Date().toISOString(),
        cfo_approved_by: approvedBy,
      })
      .eq("id", cycleId);

    await supabase
      .from("cash_requests")
      .update({ status: "approved" })
      .eq("cycle_id", cycleId)
      .in("status", ["submitted", "requested"]);
  } else {
    await supabase
      .from("cash_request_cycles")
      .update({ status: "rejected" })
      .eq("id", cycleId);
  }

  await supabase.from("audit_events").insert({
    event_type: action === "approve" ? "cash_requests_approved" : "cash_requests_rejected",
    payload: { cycle_id: cycleId, action, approved_by: approvedBy },
  });

  return NextResponse.json({ ok: true, action });
}
