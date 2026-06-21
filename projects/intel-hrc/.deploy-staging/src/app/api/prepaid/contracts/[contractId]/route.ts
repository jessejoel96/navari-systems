import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generatePrepaidInitialBooking, buildPrepaidTxt } from "@/lib/sage/prepaid";
import { contractToSageInput } from "@/lib/prepaid/contracts";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("prepaid_contracts")
    .select(`
      *,
      entities(name, code, sage_folder, purchase_journal, general_journal, account_digits),
      suppliers(name, aux_code, supplier_account),
      prepaid_schedule_lines(*),
      prepaid_interco_allocations(*, entities(name, code))
    `)
    .eq("id", contractId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params;
  const body = await req.json() as { action: string; invoice_date?: string };
  const supabase = createServiceClient();

  if (body.action !== "export_initial") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { data: contract } = await supabase
    .from("prepaid_contracts")
    .select("*, entities(code, sage_folder)")
    .eq("id", contractId)
    .single();

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sageInput = contractToSageInput(contract, body.invoice_date);
  const lines = generatePrepaidInitialBooking(sageInput);
  const { txt, balanced, totalDebit, totalCredit } = buildPrepaidTxt(lines);

  if (!balanced) {
    return NextResponse.json({ error: "Generated lines are not balanced" }, { status: 422 });
  }

  const entity = Array.isArray(contract.entities) ? contract.entities[0] : contract.entities;
  const filename = `UPLOAD PREPAID-STEP1-${contract.label.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}-${entity?.code ?? "HQ"}.txt`;
  const storagePath = `prepaid/${contractId}/${filename}`;

  await supabase.storage.from("invoice-files").upload(storagePath, txt, {
    contentType: "text/plain",
    upsert: true,
  });

  await supabase
    .from("prepaid_contracts")
    .update({
      step1_status: "exported",
      step1_exported_at: new Date().toISOString(),
      step1_file_path: storagePath,
    })
    .eq("id", contractId);

  await supabase.from("audit_events").insert({
    event_type: "prepaid_step1_exported",
    payload: { contract_id: contractId, file: filename, total: totalDebit },
  });

  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Balanced": String(balanced),
      "X-Total-Debit": String(totalDebit),
      "X-Total-Credit": String(totalCredit),
    },
  });
}
