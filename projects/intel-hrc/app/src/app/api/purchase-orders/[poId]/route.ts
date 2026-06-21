import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ poId: string }> }
) {
  const { poId } = await params;
  const body = await req.json() as { action?: string; notes?: string };
  const supabase = createServiceClient();

  const update: Record<string, unknown> = {};

  if (body.action === "send_to_supplier") {
    update.status = "po_sent";
    update.sent_to_supplier_at = new Date().toISOString();
  } else if (body.notes !== undefined) {
    update.notes = body.notes;
  }

  const { data, error } = await supabase
    .from("purchase_orders")
    .update(update)
    .eq("id", poId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
