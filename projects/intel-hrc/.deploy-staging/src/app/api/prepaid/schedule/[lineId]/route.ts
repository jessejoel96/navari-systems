import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lineId: string }> }
) {
  const { lineId } = await params;
  const body = await req.json().catch(() => ({})) as { action?: string };
  const supabase = createServiceClient();

  const status = body.action === "exported" ? "exported" : "sage_imported";
  const update: Record<string, unknown> = { status };
  if (status === "sage_imported") {
    update.sage_imported_at = new Date().toISOString();
  } else {
    update.exported_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("prepaid_schedule_lines")
    .update(update)
    .eq("id", lineId)
    .select("id, contract_id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
