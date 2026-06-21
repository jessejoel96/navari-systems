import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createPrepaidContract, type PrepaidContractInput } from "@/lib/prepaid/contracts";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const year = req.nextUrl.searchParams.get("year");

  let query = supabase
    .from("prepaid_contracts")
    .select(`
      *,
      entities(name, code, account_digits),
      suppliers(name, aux_code),
      prepaid_schedule_lines(id, period_month, period_year, amount, status, scheduled_date, label),
      source_invoice:invoices(id, invoice_number, invoice_date)
    `)
    .order("created_at", { ascending: false });

  if (year) {
    query = query.gte("coverage_start", `${year}-01-01`).lte("coverage_start", `${year}-12-31`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as PrepaidContractInput;

  if (!body.entity_id || !body.label || !body.total_amount || !body.coverage_start || !body.coverage_end) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const contract = await createPrepaidContract(supabase, body);
    return NextResponse.json(contract, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create contract" },
      { status: 500 }
    );
  }
}
