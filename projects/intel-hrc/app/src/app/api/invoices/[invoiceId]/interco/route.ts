import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

type AllocationInput = {
  entity_id: string;
  interco_code_id: string;
  allocation_ratio: number;
  gl_account?: string;
};

/**
 * GET  — list allocations for invoice
 * PUT  — replace allocations with manual ratios (must sum to 100)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("intercompany_allocations")
    .select("*, entities(name, code), interco_codes(code, gl_account)")
    .eq("invoice_id", invoiceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const body = await req.json() as { allocations: AllocationInput[] };
  const supabase = createServiceClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, gross_amount, entity_id")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const ratios = body.allocations ?? [];
  const totalRatio = ratios.reduce((s, a) => s + a.allocation_ratio, 0);
  if (ratios.length > 0 && Math.abs(totalRatio - 100) > 0.01) {
    return NextResponse.json({ error: `Ratios must sum to 100% (currently ${totalRatio.toFixed(2)}%)` }, { status: 422 });
  }

  await supabase.from("intercompany_allocations").delete().eq("invoice_id", invoiceId);

  if (ratios.length > 0) {
    const rows = ratios.map((a) => ({
      invoice_id: invoiceId,
      entity_id: a.entity_id,
      interco_code_id: a.interco_code_id,
      allocation_ratio: a.allocation_ratio,
      amount: Math.round((invoice.gross_amount * a.allocation_ratio) / 100),
      gl_account: a.gl_account ?? "4612000",
    }));

    const { error } = await supabase.from("intercompany_allocations").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("invoices")
    .update({
      is_intercompany: ratios.length > 0,
      ...(ratios.length > 0 ? { invoice_type: "intercompany" } : {}),
    })
    .eq("id", invoiceId);

  return NextResponse.json({ ok: true, count: ratios.length });
}
