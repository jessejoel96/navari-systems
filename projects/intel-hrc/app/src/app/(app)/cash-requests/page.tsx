import { createServiceClient } from "@/lib/supabase/server";
import CashRequestsShell from "@/components/cash-requests/CashRequestsShell";

export const dynamic = "force-dynamic";

export default async function CashRequestsPage() {
  const supabase = createServiceClient();

  const { data: cycles } = await supabase
    .from("cash_request_cycles")
    .select(`
      *,
      cash_requests(
        id, entity_id, status, period,
        amount_requested, amount_approved,
        opening_balance, expense_actual_amount,
        submission_received_at, request_email_sent_at, notes,
        justification_path, justification_received_at,
        justification_status, justification_confirmed_at, justification_notes,
        cr_confirmed_at,
        entities(name, code, country, contact_email),
        cash_request_line_items(sn, description, budget_code, amount_requested, amount_approved, item_type, remarks)
      )
    `)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  return <CashRequestsShell initialCycles={cycles ?? []} />;
}
