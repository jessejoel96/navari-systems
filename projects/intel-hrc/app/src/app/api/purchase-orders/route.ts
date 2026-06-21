import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const entityId = req.nextUrl.searchParams.get("entity_id");
  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("purchase_orders")
    .select("*, entities(name, code), suppliers(name, aux_code)")
    .order("created_at", { ascending: false });

  if (entityId) query = query.eq("entity_id", entityId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json();

  if (!body.entity_id || !body.po_number || body.amount == null) {
    return NextResponse.json({ error: "entity_id, po_number, and amount required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({
      entity_id: body.entity_id,
      supplier_id: body.supplier_id ?? null,
      po_number: body.po_number,
      proforma_number: body.proforma_number ?? null,
      proforma_date: body.proforma_date ?? null,
      description: body.description ?? null,
      amount: body.amount,
      status: body.status ?? "po_created",
      notes: body.notes ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    event_type: "purchase_order_created",
    payload: { po_id: data.id, po_number: data.po_number, from_proforma: body.proforma_number },
  });

  return NextResponse.json(data, { status: 201 });
}
