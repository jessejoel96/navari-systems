import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateScheduleForContract } from "@/lib/prepaid/contracts";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params;
  const supabase = createServiceClient();

  try {
    const schedule = await generateScheduleForContract(supabase, contractId);
    return NextResponse.json({ ok: true, lines: schedule.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
