import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "*, entities(name, code, sage_folder, purchase_journal, account_digits), suppliers(name, aux_code, supplier_account)"
    )
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetail invoice={invoice} />;
}
