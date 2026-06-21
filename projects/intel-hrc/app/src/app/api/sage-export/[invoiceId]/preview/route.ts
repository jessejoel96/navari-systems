import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildSageExportForInvoice } from "@/lib/sage/build-export";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = createServiceClient();

  try {
    const build = await buildSageExportForInvoice(supabase, invoiceId);

    return NextResponse.json({
      invoice_id: invoiceId,
      file_name: build.fileName,
      sage_folder: build.sageFolder,
      entity_code: build.entityCode,
      journal: build.journal,
      balanced: build.balanced,
      total_debit: build.totalDebit,
      total_credit: build.totalCredit,
      lines: build.lines.map((l) => ({
        journal: l.journal,
        date: l.date,
        aux_debit: l.auxDebit,
        account: l.account,
        aux_credit: l.auxCredit,
        label: l.label,
        debit: l.debit,
        credit: l.credit,
      })),
      txt_preview: build.txt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
