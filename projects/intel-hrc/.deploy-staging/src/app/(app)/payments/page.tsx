import { createServiceClient } from "@/lib/supabase/server";
import { PaymentsShell } from "@/components/payments/PaymentsShell";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = createServiceClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Bank invoices (sage_imported)
  const { data: bankInvoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, description, gross_amount, invoice_date, is_recurring, payment_category, payment_channel, status, suppliers:supplier_id(name), entities(code)"
    )
    .eq("status", "sage_imported")
    .eq("payment_channel", "bank")
    .order("invoice_date", { ascending: false });

  // Maviance invoices (sage_imported)
  const { data: mavianceInvoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, description, gross_amount, invoice_date, is_recurring, payment_category, payment_channel, status, suppliers:supplier_id(name), entities(code)"
    )
    .eq("status", "sage_imported")
    .eq("payment_channel", "maviance")
    .order("invoice_date", { ascending: false });

  // All payment batches
  const { data: batches } = await supabase
    .from("payment_batches")
    .select(
      `*,
      payment_lines(
        invoice_id,
        amount,
        invoices(id, invoice_number, description, gross_amount, suppliers:supplier_id(name))
      ),
      payment_documents(id, doc_type, invoice_id, file_name, storage_path, mime_type, uploaded_by, created_at)`
    )
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false });

  return (
    <PaymentsShell
      bankInvoices={bankInvoices ?? []}
      mavianceInvoices={mavianceInvoices ?? []}
      batches={batches ?? []}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  );
}
