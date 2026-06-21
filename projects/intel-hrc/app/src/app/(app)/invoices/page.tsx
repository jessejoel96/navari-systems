import { createServiceClient } from "@/lib/supabase/server";
import { InvoiceList } from "@/components/invoices/InvoiceList";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const supabase = createServiceClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, description, gross_amount, net_amount, vat_amount, wht_amount, status, invoice_type, invoice_date, currency, entity_id, supplier_id, entities(name, code), suppliers(name, aux_code)"
    )
    .order("created_at", { ascending: false });

  const { data: entities } = await supabase
    .from("entities")
    .select("id, name, code")
    .order("name");

  return (
    <InvoiceList invoices={invoices ?? []} entities={entities ?? []} />
  );
}
