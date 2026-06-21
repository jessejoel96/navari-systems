/**
 * PATCH /api/invoices/[invoiceId]/status
 * Body: { status: "reviewed" | "approved" | "rejected" }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { canApproveWithoutPo } from "@/lib/invoices/po-workflow";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  received: ["reviewed", "approved", "rejected"],
  extracted: ["reviewed", "approved", "rejected"],
  reviewed: ["approved", "rejected"],
  matched: ["approved", "rejected"],
  pending_approval: ["approved", "rejected"],
  rejected: ["reviewed", "approved"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = createServiceClient();
  const { status: newStatus } = await req.json();

  if (!newStatus || !["reviewed", "approved", "rejected"].includes(newStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status, entity_id, supplier_id, expense_account, gross_amount, invoice_date, is_recurring, po_matched, purchase_order_id")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const allowed = ALLOWED_TRANSITIONS[invoice.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      { error: `Cannot move from ${invoice.status} to ${newStatus}` },
      { status: 422 }
    );
  }

  if (newStatus === "approved") {
    if (!invoice.entity_id || !invoice.invoice_date || !invoice.gross_amount) {
      return NextResponse.json(
        { error: "Entity, date, and amount are required before approving for Sage" },
        { status: 422 }
      );
    }
    if (!canApproveWithoutPo(invoice)) {
      return NextResponse.json(
        {
          error: "One-off invoices require a matched purchase order before approval. Create PO from proforma, then link and match.",
          po_required: true,
        },
        { status: 422 }
      );
    }
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: newStatus })
    .eq("id", invoiceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
