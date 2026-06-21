/**
 * PATCH /api/cash-requests/cycles/[cycleId]
 * Update mutable cycle fields (expense_period_label, deadline_date, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ALLOWED = ["expense_period_label", "deadline_date", "justification_deadline_date", "notes"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const body = await req.json() as Partial<Record<(typeof ALLOWED)[number], string>>;

  const update: Partial<Record<(typeof ALLOWED)[number], string>> = {};
  for (const field of ALLOWED) {
    if (field in body) update[field] = body[field];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("cash_request_cycles")
    .update(update)
    .eq("id", cycleId)
    .select("id, label, expense_period_label, deadline_date")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
