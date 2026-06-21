import { createServiceClient } from "@/lib/supabase/server";
import { ApprovalBoard } from "@/components/approvals/ApprovalBoard";
import { AppPageHeader } from "@/components/layout/AppPageHeader";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const supabase = createServiceClient();

  const { data: approvals } = await supabase
    .from("approvals")
    .select(
      "*, invoices(id, invoice_number, description, gross_amount, status, entity_id, entities(name, code), suppliers:supplier_id(name))"
    )
    .order("requested_at", { ascending: false });

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Approvals"
        description="Track approval requests sent to the CFO or CEO. Reminders sent after 7 days. Payment batches are approved from the Payments module."
      />
      <ApprovalBoard approvals={approvals ?? []} />
    </div>
  );
}
