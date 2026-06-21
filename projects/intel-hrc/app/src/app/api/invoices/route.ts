import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyNewInvoice } from "@/lib/email/notify";
import { applyPaymentDefaults } from "@/lib/invoices/payment-schedule";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = applyPaymentDefaults(await req.json());

  const isRecurring = body.is_recurring ?? false;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      entity_id: body.entity_id,
      supplier_id: body.supplier_id || null,
      invoice_number: body.invoice_number || null,
      invoice_date: body.invoice_date || null,
      description: body.description || null,
      invoice_type: body.invoice_type || "standard",
      gross_amount: body.gross_amount || 0,
      net_amount: body.net_amount || 0,
      vat_amount: body.vat_amount || 0,
      wht_amount: body.wht_amount || 0,
      expense_account: body.expense_account || null,
      po_number: body.po_number || null,
      purchase_order_id: body.purchase_order_id || null,
      proforma_number: body.proforma_number || null,
      status: body.ocr_json ? "extracted" : "received",
      ocr_json: body.ocr_json || null,
      ocr_confidence: body.ocr_confidence || null,
      label: body.description || body.invoice_number || "Invoice",
      is_recurring: isRecurring,
      po_matched: isRecurring ? true : Boolean(body.purchase_order_id),
      payment_channel: body.payment_channel || "bank",
      payment_category: body.payment_category || null,
      payment_schedule: body.payment_schedule,
      scheduled_payment_day: body.scheduled_payment_day,
      scheduled_payment_weekday: body.scheduled_payment_weekday,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Resolve entity code for notification
  let entityCode = "HQ";
  if (body.entity_id) {
    const { data: ent } = await supabase
      .from("entities")
      .select("code")
      .eq("id", body.entity_id)
      .single();
    entityCode = ent?.code || entityCode;
  }

  // Resolve supplier name
  let supplierName = "Unknown";
  if (body.supplier_id) {
    const { data: sup } = await supabase
      .from("suppliers")
      .select("name")
      .eq("id", body.supplier_id)
      .single();
    supplierName = sup?.name || supplierName;
  }

  // Notify Tina
  try {
    await notifyNewInvoice({
      id: data.id,
      supplier_name: supplierName,
      amount: body.gross_amount || 0,
      entity_code: entityCode,
      description: body.description || body.invoice_number || "Invoice",
      source: "upload",
    });
  } catch {
    // Notification failure shouldn't block invoice creation
  }

  return NextResponse.json({ id: data.id });
}
