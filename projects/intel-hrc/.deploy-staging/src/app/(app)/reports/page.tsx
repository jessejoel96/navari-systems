import { createServiceClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = createServiceClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("status, gross_amount, entity_id, entities(code)");

  type Bucket = { count: number; total: number };

  const byStatus: Record<string, Bucket> = (invoices ?? []).reduce((acc: Record<string, Bucket>, inv: any) => {
    if (!acc[inv.status]) acc[inv.status] = { count: 0, total: 0 };
    acc[inv.status].count++;
    acc[inv.status].total += inv.gross_amount;
    return acc;
  }, {} as Record<string, Bucket>);

  const byEntity: Record<string, Bucket> = (invoices ?? []).reduce((acc: Record<string, Bucket>, inv: any) => {
    const code = inv.entities?.code ?? "Unknown";
    if (!acc[code]) acc[code] = { count: 0, total: 0 };
    acc[code].count++;
    acc[code].total += inv.gross_amount;
    return acc;
  }, {} as Record<string, Bucket>);

  const totalAmount = (invoices ?? []).reduce((sum: number, inv: any) => sum + inv.gross_amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          AP summary across all entities. Syncs to Airtable for extended dashboards.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Total Invoices</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{invoices?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Total AP Value</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-medium text-gray-500">Status Groups</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{Object.keys(byStatus).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By status */}
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">By Status</h2>
          </div>
          {Object.keys(byStatus).length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <BarChart3 className="h-10 w-10 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">No data yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {Object.entries(byStatus)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([status, data]) => (
                  <li key={status} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium capitalize text-gray-800">
                        {status.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-400">{data.count} invoices</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(data.total)}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* By entity */}
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">By Entity</h2>
          </div>
          {Object.keys(byEntity).length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <BarChart3 className="h-10 w-10 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">No data yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {Object.entries(byEntity)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([code, data]) => (
                  <li key={code} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-green-light text-xs font-semibold text-brand-green">
                        {code.slice(0, 2)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{code}</p>
                        <p className="text-xs text-gray-400">{data.count} invoices</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(data.total)}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
