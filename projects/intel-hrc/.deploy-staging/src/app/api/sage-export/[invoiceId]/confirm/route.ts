/**
 * POST /api/sage-export/[invoiceId]/confirm
 * Tina confirms the .txt was imported into Sage 100.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = createServiceClient();
  const body = await req.json().catch(() => ({}));
  const confirmedBy = (body as { confirmed_by?: string }).confirmed_by ?? "Tina-Randa";

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status !== "sage_exported") {
    return NextResponse.json(
      { error: "Invoice must be sage_exported before confirming import" },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();

  const { data: latestExport } = await supabase
    .from("sage_exports")
    .select("id")
    .eq("invoice_id", invoiceId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestExport) {
    await supabase
      .from("sage_exports")
      .update({ imported_at: now, import_confirmed_by: confirmedBy })
      .eq("id", latestExport.id);
  }

  await supabase
    .from("invoices")
    .update({ status: "sage_imported" })
    .eq("id", invoiceId);

  return NextResponse.json({ ok: true, status: "sage_imported", imported_at: now });
}
