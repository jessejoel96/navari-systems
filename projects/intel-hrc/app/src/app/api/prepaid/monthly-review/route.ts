import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const CFO_EMAIL = process.env.CFO_EMAIL;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * GET  /api/prepaid/monthly-review?month=&year=
 * POST — action: compile | validate | send_to_cfo
 */
export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const month = Number(req.nextUrl.searchParams.get("month"));
  const year = Number(req.nextUrl.searchParams.get("year"));

  if (!month || !year) {
    const { data } = await supabase.from("prepaid_monthly_reviews").select("*").order("period_year", { ascending: false }).limit(12);
    return NextResponse.json(data);
  }

  const { data } = await supabase
    .from("prepaid_monthly_reviews")
    .select("*")
    .eq("period_month", month)
    .eq("period_year", year)
    .maybeSingle();

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json() as {
    action: "compile" | "validate" | "send_to_cfo";
    month: number;
    year: number;
    validated_by?: string;
    notes?: string;
  };

  if (!body.month || !body.year || !body.action) {
    return NextResponse.json({ error: "month, year, action required" }, { status: 400 });
  }

  const { data: lines } = await supabase
    .from("prepaid_schedule_lines")
    .select(`
      id, period_month, period_year, amount, label, status, scheduled_date,
      prepaid_contracts(
        label, prepaid_category, prepaid_account, release_account, total_amount,
        entities(name, code)
      )
    `)
    .eq("period_month", body.month)
    .eq("period_year", body.year);

  if (body.action === "compile") {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("PREPAID SUMMARY");
    ws.columns = [
      { key: "entity", width: 14 },
      { key: "label", width: 36 },
      { key: "category", width: 12 },
      { key: "prepaid_gl", width: 14 },
      { key: "release_gl", width: 14 },
      { key: "amount", width: 18 },
      { key: "status", width: 14 },
      { key: "date", width: 12 },
    ];

    ws.addRow([`PREPAID AMORTIZATION SUMMARY — ${MONTHS[body.month - 1]} ${body.year}`]);
    ws.mergeCells("A1:H1");
    ws.getRow(1).font = { bold: true, size: 12 };

    ws.addRow(["Entity", "Contract", "Category", "476 Account", "Release Account", "Amount (XAF)", "Status", "Post Date"]);

    let total = 0;
    for (const line of lines ?? []) {
      const c = Array.isArray(line.prepaid_contracts) ? line.prepaid_contracts[0] : line.prepaid_contracts;
      const entity = Array.isArray(c?.entities) ? c?.entities[0] : c?.entities;
      ws.addRow([
        entity?.code ?? "—",
        c?.label ?? line.label,
        c?.prepaid_category ?? "—",
        c?.prepaid_account ?? "—",
        c?.release_account ?? "—",
        line.amount,
        line.status,
        line.scheduled_date,
      ]);
      total += line.amount ?? 0;
    }

    ws.addRow([]);
    ws.addRow(["", "", "", "", "TOTAL", total, "", ""]);

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    const filename = `prepaid-cfo-summary-${body.month}-${body.year}.xlsx`;
    const storagePath = `prepaid/reviews/${body.year}-${body.month}/${filename}`;

    await supabase.storage.from("invoice-files").upload(storagePath, buf, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

    await supabase.from("prepaid_monthly_reviews").upsert({
      period_month: body.month,
      period_year: body.year,
      status: "draft",
      summary_file_path: storagePath,
    }, { onConflict: "period_month,period_year" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  if (body.action === "validate") {
    await supabase.from("prepaid_monthly_reviews").upsert({
      period_month: body.month,
      period_year: body.year,
      status: "validated",
      validated_at: new Date().toISOString(),
      validated_by: body.validated_by ?? "Tina-Randa",
      notes: body.notes ?? null,
    }, { onConflict: "period_month,period_year" });

    return NextResponse.json({ ok: true, status: "validated" });
  }

  if (body.action === "send_to_cfo") {
    const { data: review } = await supabase
      .from("prepaid_monthly_reviews")
      .select("*")
      .eq("period_month", body.month)
      .eq("period_year", body.year)
      .single();

    if (!review || review.status !== "validated") {
      return NextResponse.json({ error: "Validate the summary before sending to CFO" }, { status: 422 });
    }

    if (!CFO_EMAIL) {
      return NextResponse.json({ error: "CFO email not configured" }, { status: 400 });
    }

    const total = (lines ?? []).reduce((s: number, l: { amount?: number | null }) => s + (l.amount ?? 0), 0);
    const downloadUrl = review.summary_file_path
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/storage?path=${encodeURIComponent(review.summary_file_path)}`
      : "#";

    await resend.emails.send({
      from: FROM,
      to: CFO_EMAIL,
      cc: process.env.AP_ACCOUNTANT_EMAIL,
      subject: `[REVIEW] Prepaid Amortization Summary — ${MONTHS[body.month - 1]} ${body.year} — ${total.toLocaleString("fr-FR")} XAF`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;">
          <h2>Prepaid Expense Amortization — ${MONTHS[body.month - 1]} ${body.year}</h2>
          <p>Tina has validated the monthly prepaid amortization summary for your review.</p>
          <p><strong>Total OPD release:</strong> ${total.toLocaleString("fr-FR")} XAF</p>
          <p><strong>Lines:</strong> ${(lines ?? []).length}</p>
          <p><a href="${downloadUrl}">Download Summary Excel</a></p>
        </div>
      `,
    });

    await supabase
      .from("prepaid_monthly_reviews")
      .update({ status: "sent_to_cfo", cfo_sent_at: new Date().toISOString() })
      .eq("period_month", body.month)
      .eq("period_year", body.year);

    return NextResponse.json({ ok: true, sent_to: CFO_EMAIL });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
