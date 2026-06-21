/**
 * POST /api/sage-export/batch
 * Body: { invoice_ids: string[] }
 * Generates one combined .txt per entity for multiple approved invoices.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildSageBatchExport } from "@/lib/sage/build-export";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { invoice_ids } = await req.json();

  if (!Array.isArray(invoice_ids) || invoice_ids.length === 0) {
    return NextResponse.json({ error: "invoice_ids required" }, { status: 400 });
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, status")
    .in("id", invoice_ids);

  const invalid = (invoices ?? []).filter((i: { id: string; status: string }) => i.status !== "approved");
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: "All invoices must be approved before batch export", invalid: invalid.map((i: { id: string }) => i.id) },
      { status: 422 }
    );
  }

  try {
    const batch = await buildSageBatchExport(supabase, invoice_ids);

    if (!batch.balanced) {
      return NextResponse.json(
        {
          error: "Combined entry is not balanced",
          totalDebit: batch.totalDebit,
          totalCredit: batch.totalCredit,
        },
        { status: 422 }
      );
    }

    const storagePath = `sage-exports/${batch.entityCode}/batch/${batch.fileName}`;
    await supabase.storage
      .from("invoice-files")
      .upload(storagePath, Buffer.from(batch.combinedTxt, "utf-8"), {
        contentType: "text/plain; charset=utf-8",
        upsert: true,
      });

    for (const build of batch.builds) {
      await supabase.from("sage_exports").insert({
        invoice_id: build.invoiceId,
        entity_id: build.entityId,
        journal_code: build.journal,
        file_name: batch.fileName,
        storage_path: storagePath,
        line_count: build.lines.length,
        total_debit: build.totalDebit,
        total_credit: build.totalCredit,
        is_balanced: true,
      });

      await supabase
        .from("invoices")
        .update({ status: "sage_exported" })
        .eq("id", build.invoiceId);
    }

    return new NextResponse(batch.combinedTxt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${batch.fileName}"`,
        "X-Sage-Folder": batch.sageFolder,
        "X-Invoice-Count": String(batch.builds.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Batch export failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
