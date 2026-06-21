import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are the AP (Accounts Payable) assistant for Intel HRC. You help Tina-Randa, the AP Accountant, with her daily workflow.

You have access to the AP database which includes:
- 8 entities (Intel HRC HQ + 7 IOS subsidiaries across West/Central Africa)
- Invoices with statuses: received, extracted, reviewed, matched, pending_approval, approved, rejected, sage_exported, sage_imported, payment_scheduled, paid
- CFO approval tracking with reminder counts
- Sage .txt export history
- Payment lines (bank + Maviance mobile money)
- Supplier master data with per-entity auxiliary codes

Key business rules:
- Intel HRC uses journal PURC; all IOS entities use ACH
- Currency is XAF (FCFA) for all entities
- CFO approval reminders after 7 days
- Payment cut-off: Wednesday 12:00, execution: Friday
- Consultancy invoices have 20% WHT (account 4472700)
- Intercompany splits use account 4612000 with INC01-INC09 codes

When asked about data, provide specific numbers. When asked to draft emails, be professional and concise. Always reference entity codes (HQ, CMR, CIV, BF, SEN, RDC, NIGER, MALI) when relevant.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const supabase = createServiceClient();

  // Gather context from the database
  const [
    { data: invoiceSummary },
    { data: pendingApprovals },
    { data: entities },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("status, gross_amount, entity_id, entities(code)")
      .limit(200),
    supabase
      .from("approvals")
      .select("decision, reminder_count, requested_at, invoices(description, gross_amount, entities(code))")
      .eq("decision", "pending"),
    supabase.from("entities").select("code, name"),
  ]);

  const contextBlock = `
Current AP data snapshot:
- Total invoices: ${invoiceSummary?.length ?? 0}
- Pending CFO approvals: ${pendingApprovals?.length ?? 0}
- Entities: ${entities?.map((e: any) => e.code).join(", ") ?? "none"}

Invoice status breakdown:
${Object.entries(
  (invoiceSummary ?? []).reduce(
    (acc: Record<string, number>, inv: any) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  )
)
  .map(([status, count]) => `  ${status}: ${count}`)
  .join("\n")}
`;

  try {
    const response = await fetch(`${process.env.QWEN_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\n" + contextBlock },
          ...messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "The AI assistant is currently unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
