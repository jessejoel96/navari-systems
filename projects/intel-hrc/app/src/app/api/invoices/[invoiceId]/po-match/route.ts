import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/invoices/[invoiceId]/po-match
 * Link invoice to PO and validate amounts match.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const body = await req.json() as { purchase_order_id: string; force?: boolean };
  const supabase = createServiceClient();

  const [{ data: invoice }, { data: po }] = await Promise.all([
    supabase.from("invoices").select("id, gross_amount, is_recurring, status").eq("id", invoiceId).single(),
    supabase.from("purchase_orders").select("id, amount, po_number").eq("id", body.purchase_order_id).single(),
  ]);

  if (!invoice || !po) {
    return NextResponse.json({ error: "Invoice or PO not found" }, { status: 404 });
  }

  if (invoice.is_recurring) {
    return NextResponse.json({ error: "Recurring invoices do not require PO matching" }, { status: 422 });
  }

  const amountMatch = invoice.gross_amount === po.amount;
  if (!amountMatch && !body.force) {
    return NextResponse.json({
      error: "Invoice amount does not match PO amount",
      invoice_amount: invoice.gross_amount,
      po_amount: po.amount,
      can_force: true,
    }, { status: 422 });
  }

  await supabase
    .from("invoices")
    .update({
      purchase_order_id: po.id,
      po_number: po.po_number,
      po_matched: true,
      status: invoice.status === "received" || invoice.status === "extracted" ? "matched" : invoice.status,
    })
    .eq("id", invoiceId);

  await supabase
    .from("purchase_orders")
    .update({ status: "matched" })
    .eq("id", po.id);

  return NextResponse.json({ ok: true, po_matched: true, amount_match: amountMatch });
}
