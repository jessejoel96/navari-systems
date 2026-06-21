import { createServiceClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

async function getDashboardData() {
  const supabase = createServiceClient();
  const weekStart = startOfWeek();

  const [
    { count: totalInvoices },
    { count: needsReview },
    { count: pendingApproval },
    { count: readyForExport },
    { count: readyForPayment },
    { count: overdue },
    { count: completedThisWeek },
    { count: sageExportedThisWeek },
    { data: recentInvoices },
    { data: entities },
    { data: activeCycle },
  ] = await Promise.all([
    supabase.from("invoices").select("*", { count: "exact", head: true }),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["received", "extracted"]),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_approval"),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["sage_imported", "payment_scheduled"]),
    supabase
      .from("approvals")
      .select("*", { count: "exact", head: true })
      .eq("decision", "pending")
      .lt("requested_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["approved", "sage_exported", "sage_imported", "payment_scheduled", "paid"])
      .gte("updated_at", weekStart),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .in("status", ["sage_exported", "sage_imported", "paid"])
      .gte("updated_at", weekStart),
    supabase
      .from("invoices")
      .select("id, invoice_number, description, gross_amount, status, invoice_date, entity_id, entities(name, code)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("entities").select("id, name, code").order("name"),
    supabase
      .from("cash_request_cycles")
      .select("id, label, status, deadline_date, period_month, period_year")
      .not("status", "eq", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    totalInvoices: totalInvoices ?? 0,
    needsReview: needsReview ?? 0,
    pendingApproval: pendingApproval ?? 0,
    readyForExport: readyForExport ?? 0,
    readyForPayment: readyForPayment ?? 0,
    overdue: overdue ?? 0,
    completedThisWeek: completedThisWeek ?? 0,
    sageExportedThisWeek: sageExportedThisWeek ?? 0,
    recentInvoices: recentInvoices ?? [],
    entities: entities ?? [],
    activeCycle: activeCycle ?? null,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardShell data={data} />;
}
