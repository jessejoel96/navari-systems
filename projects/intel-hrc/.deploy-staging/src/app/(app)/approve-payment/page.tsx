/**
 * /approve-payment?token=...&batch=...&action=approve|reject
 *
 * Public page that handles CFO/CEO clicking Approve or Reject in email.
 * Validates the token hash and records the decision.
 */

import { createServiceClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ token?: string; batch?: string; action?: string }>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ApprovePaymentPage({ searchParams }: Props) {
  const params = await searchParams;
  const { token, batch: batchId, action } = params;

  if (!token || !batchId || !action) {
    return <ErrorPage message="Invalid approval link. Required parameters are missing." />;
  }

  const supabase = createServiceClient();

  const { data: batch } = await supabase
    .from("payment_batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (!batch) {
    return <ErrorPage message="Payment batch not found." />;
  }

  // Verify token
  const expectedHash = crypto.createHash("sha256").update(token).digest("hex");
  const storedHash = (batch.notes ?? "").split("approval_token_hash:")[1]?.trim();

  if (!storedHash || storedHash !== expectedHash) {
    return <ErrorPage message="Invalid or expired approval link." />;
  }

  if (batch.status === "approved" || batch.status === "rejected") {
    return (
      <AlreadyDecidedPage
        status={batch.status}
        period={`${MONTH_NAMES[batch.period_month - 1]} ${batch.period_year}`}
        amount={batch.total_amount}
        approvedBy={batch.approved_by}
        approvedAt={batch.approved_at}
      />
    );
  }

  // Record decision
  const now = new Date().toISOString();
  const status = action === "approve" ? "approved" : "rejected";

  await supabase
    .from("payment_batches")
    .update({
      status,
      approved_at: now,
      approved_by: batch.approver_role.toUpperCase(),
    })
    .eq("id", batchId);

  // Update related approval records
  await supabase
    .from("approvals")
    .update({
      decision: action === "approve" ? "approved" : "rejected",
      responded_at: now,
    })
    .eq("approver_role", batch.approver_role)
    .eq("decision", "pending");

  const period = `${MONTH_NAMES[batch.period_month - 1]} ${batch.period_year}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-6 ${
          action === "approve" ? "bg-green-100" : "bg-red-100"
        }`}>
          <span className="text-3xl">{action === "approve" ? "✓" : "✕"}</span>
        </div>

        <h1 className={`text-2xl font-bold mb-2 ${
          action === "approve" ? "text-green-700" : "text-red-700"
        }`}>
          Batch {action === "approve" ? "Approved" : "Rejected"}
        </h1>

        <p className="text-gray-500 mb-6">
          {period} · {batch.total_amount.toLocaleString("fr-FR")} XAF
        </p>

        {action === "approve" && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-left text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">Next steps:</p>
            <ol className="space-y-1.5 list-decimal list-inside">
              <li>Print the payment sheet attached in the email</li>
              <li>Sign the sheet and each invoice listed</li>
              <li>Hand signed documents to Tina-Randa (AP Accountant)</li>
              <li>Tina will scan and upload the signed copies</li>
            </ol>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Recorded at {new Date(now).toLocaleString("en-GB")} · Intel HRC AP Workflow
        </p>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <span className="text-3xl">⚠</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Link</h1>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

function AlreadyDecidedPage({
  status,
  period,
  amount,
  approvedBy,
  approvedAt,
}: {
  status: string;
  period: string;
  amount: number;
  approvedBy: string | null;
  approvedAt: string | null;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-6 ${
          status === "approved" ? "bg-blue-100" : "bg-gray-100"
        }`}>
          <span className="text-3xl">{status === "approved" ? "✓" : "✕"}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Already {status}</h1>
        <p className="text-sm text-gray-500">
          {period} · {amount.toLocaleString("fr-FR")} XAF
        </p>
        {approvedAt && (
          <p className="text-xs text-gray-400 mt-2">
            {approvedBy} · {new Date(approvedAt).toLocaleString("en-GB")}
          </p>
        )}
      </div>
    </div>
  );
}
