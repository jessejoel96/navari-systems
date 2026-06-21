import { createServiceClient } from "@/lib/supabase/server";
import { SageExportList } from "@/components/sage/SageExportList";

export const dynamic = "force-dynamic";

export default async function SageExportsPage() {
  const supabase = createServiceClient();

  const { data: exports } = await supabase
    .from("sage_exports")
    .select(
      "*, entities(name, code, sage_folder), invoices(invoice_number, description, suppliers:supplier_id(name))"
    )
    .order("generated_at", { ascending: false });

  const { data: readyInvoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, description, gross_amount, invoice_type, invoice_date, entity_id, entities(name, code, sage_folder, purchase_journal), suppliers:supplier_id(name, aux_code)"
    )
    .eq("status", "approved")
    .order("invoice_date", { ascending: false });

  const { data: pendingImport } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, description, gross_amount, invoice_date, entities(code, sage_folder), suppliers:supplier_id(name)"
    )
    .eq("status", "sage_exported")
    .order("updated_at", { ascending: false });

  return (
    <SageExportList
      exports={exports ?? []}
      readyInvoices={readyInvoices ?? []}
      pendingImport={pendingImport ?? []}
    />
  );
}
