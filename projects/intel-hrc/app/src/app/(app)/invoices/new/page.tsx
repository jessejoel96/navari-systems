import { createServiceClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/invoices/UploadForm";

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
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Upload Invoice</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a PDF, scan, or photo. AI will extract the key fields for your review.
        </p>
      </div>
      <UploadForm entities={entities ?? []} suppliers={suppliers ?? []} />
    </div>
  );
}
