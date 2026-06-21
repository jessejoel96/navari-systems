import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  generatePrepaidMonthlyBatch,
  buildPrepaidTxt,
  sageDateFromIso,
} from "@/lib/sage/prepaid";

type ScheduleRow = {
  id: string;
  scheduled_date: string;
  amount: number;
  label: string;
  prepaid_contracts: {
    prepaid_account: string;
    release_account: string;
    release_journal: string;
    entity_id: string;
    status: string;
    entities: { code: string } | { code: string }[] | null;
  } | {
    prepaid_account: string;
    release_account: string;
    release_journal: string;
    entity_id: string;
    status: string;
    entities: { code: string } | { code: string }[] | null;
  }[] | null;
};

/**
 * POST /api/prepaid/export-monthly
 * Body: { entity_id?, month, year, mark_exported?: boolean }
 * Generates OPD batch for all planned schedule lines in that month.
 */
export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as {
    entity_id?: string;
    month: number;
    year: number;
    mark_exported?: boolean;
  };

  if (!body.month || !body.year) {
    return NextResponse.json({ error: "month and year required" }, { status: 400 });
  }

  let query = supabase
    .from("prepaid_schedule_lines")
    .select(`
      id, period_month, period_year, scheduled_date, amount, label, status,
      prepaid_contracts(
        id, label, prepaid_account, release_account, release_journal,
        entity_id, status, step1_status,
        entities(code, sage_folder)
      )
    `)
    .eq("period_month", body.month)
    .eq("period_year", body.year)
    .in("status", ["planned", "exported"]);

  const { data: lines, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const filtered = ((lines ?? []) as ScheduleRow[]).filter((row) => {
    const c = Array.isArray(row.prepaid_contracts) ? row.prepaid_contracts[0] : row.prepaid_contracts;
    if (!c || c.status !== "active") return false;
    if (body.entity_id && c.entity_id !== body.entity_id) return false;
    return true;
  });

  if (filtered.length === 0) {
    return NextResponse.json({ error: "No schedule lines for this period" }, { status: 422 });
  }

  const batchInput = filtered.map((row: ScheduleRow) => {
    const c = Array.isArray(row.prepaid_contracts) ? row.prepaid_contracts[0] : row.prepaid_contracts!;
    return {
      contract: {
        prepaidAccount: c.prepaid_account,
        releaseAccount: c.release_account,
        releaseJournal: c.release_journal || "OPD",
      },
      line: {
        scheduledDate: sageDateFromIso(row.scheduled_date as string),
        amount: row.amount as number,
        label: row.label as string,
      },
    };
  });

  const sageLines = generatePrepaidMonthlyBatch(batchInput);
  const { txt, balanced, totalDebit, totalCredit } = buildPrepaidTxt(sageLines);

  if (!balanced) {
    return NextResponse.json({ error: "Batch not balanced" }, { status: 422 });
  }

  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const entity = filtered[0]?.prepaid_contracts;
  const ent = Array.isArray(entity) ? entity[0]?.entities : entity?.entities;
  const entCode = (Array.isArray(ent) ? ent[0] : ent)?.code ?? "ALL";
  const filename = `UPLOAD PREPAID-OPD-${MONTHS[body.month - 1]}-${body.year}-${entCode}.txt`;
  const storagePath = `prepaid/batches/${body.year}-${body.month}/${filename}`;

  await supabase.storage.from("invoice-files").upload(storagePath, txt, {
    contentType: "text/plain",
    upsert: true,
  });

  if (body.mark_exported !== false) {
    const ids = filtered.map((r: ScheduleRow) => r.id);
    await supabase
      .from("prepaid_schedule_lines")
      .update({ status: "exported", exported_at: new Date().toISOString() })
      .in("id", ids);
  }

  await supabase.from("audit_events").insert({
    event_type: "prepaid_monthly_exported",
    payload: {
      month: body.month,
      year: body.year,
      entity_id: body.entity_id,
      line_count: filtered.length,
      total: totalDebit,
      file: filename,
    },
  });

  return new NextResponse(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Line-Count": String(filtered.length),
      "X-Balanced": String(balanced),
      "X-Total": String(totalDebit),
    },
  });
}
