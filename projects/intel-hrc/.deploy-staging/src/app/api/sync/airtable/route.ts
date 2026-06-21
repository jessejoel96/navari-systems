import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  syncInvoicesToAirtable,
  syncPaymentsToAirtable,
  syncApprovalStatusToAirtable,
} from "@/lib/airtable/sync";

export async function POST() {
  const supabase = createServiceClient();

  try {
    const [{ data: invoices }, { data: payments }, { data: approvals }] =
      await Promise.all([
        supabase
          .from("invoices")
          .select(
            "id, invoice_number, description, gross_amount, net_amount, vat_amount, wht_amount, status, invoice_type, invoice_date, currency, entities(code), suppliers:supplier_id(name)"
          )
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("payment_lines")
          .select(
            "id, invoice_id, payment_type, amount, scheduled_date, executed_date, cfo_approved, entities(code), suppliers:supplier_id(name)"
          )
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("approvals")
          .select(
            "id, decision, requested_at, responded_at, reminder_count, approver_name, approver_email, invoices(description, entities(code))"
          )
          .order("requested_at", { ascending: false })
          .limit(500),
      ]);

    const results = await Promise.allSettled([
      syncInvoicesToAirtable(invoices ?? []),
      syncPaymentsToAirtable(payments ?? []),
      syncApprovalStatusToAirtable(approvals ?? []),
    ]);

    const summary = results.map((r, i) => ({
      table: ["Invoices", "Payments", "Approvals"][i],
      status: r.status,
      error: r.status === "rejected" ? (r.reason as Error).message : undefined,
    }));

    return NextResponse.json({ synced: true, summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
