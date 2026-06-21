import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildSageExportForInvoice } from "@/lib/sage/build-export";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;
  const supabase = createServiceClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!["approved", "sage_exported"].includes(invoice.status)) {
    return NextResponse.json(
      { error: "Invoice must be approved before Sage export" },
      { status: 422 }
    );
  }

  try {
    const build = await buildSageExportForInvoice(supabase, invoiceId);

    if (!build.balanced) {
      return NextResponse.json(
        {
          error: "Entry is not balanced",
          totalDebit: build.totalDebit,
          totalCredit: build.totalCredit,
          diff: build.totalDebit - build.totalCredit,
        },
        { status: 422 }
      );
    }

    const storagePath = `sage-exports/${build.entityCode}/${invoiceId}/${build.fileName}`;
    await supabase.storage
      .from("invoice-files")
      .upload(storagePath, Buffer.from(build.txt, "utf-8"), {
        contentType: "text/plain; charset=utf-8",
        upsert: true,
      });

    await supabase.from("sage_exports").insert({
      invoice_id: invoiceId,
      entity_id: build.entityId,
      journal_code: build.journal,
      file_name: build.fileName,
      storage_path: storagePath,
      line_count: build.lines.length,
      total_debit: build.totalDebit,
      total_credit: build.totalCredit,
      is_balanced: true,
    });

    await supabase
      .from("invoices")
      .update({ status: "sage_exported" })
      .eq("id", invoiceId);

    return new NextResponse(build.txt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${build.fileName}"`,
        "X-Sage-Folder": build.sageFolder,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
