import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params;
  const supabase = createServiceClient();

  await supabase
    .from("prepaid_contracts")
    .update({ step1_status: "sage_imported" })
    .eq("id", contractId);

  return NextResponse.json({ ok: true });
}
