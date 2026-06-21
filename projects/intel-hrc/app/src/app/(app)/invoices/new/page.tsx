import { createServiceClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/invoices/UploadForm";
import { AppPageHeader } from "@/components/layout/AppPageHeader";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const supabase = createServiceClient();

  const { data: entities } = await supabase
    .from("entities")
    .select("id, name, code, purchase_journal")
    .order("name");

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, aux_code, entity_id, supplier_account")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AppPageHeader
        title="Upload Invoice"
        description="Upload a PDF, scan, or photo. AI will extract the key fields for your review."
      />
      <UploadForm entities={entities ?? []} suppliers={suppliers ?? []} />
    </div>
  );
}
