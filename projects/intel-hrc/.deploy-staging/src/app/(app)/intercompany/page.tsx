import { createServiceClient } from "@/lib/supabase/server";
import { ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IntercompanyPage() {
  const supabase = createServiceClient();

  const { data: allocations } = await supabase
    .from("intercompany_allocations")
    .select(
      "id, amount, gl_account, entities(name, code), interco_codes(code), invoices(description, gross_amount)"
    )
    .order("created_at", { ascending: false });

  const { data: interco } = await supabase
    .from("interco_codes")
    .select("id, code, gl_account, entities(name, code)")
    .order("code");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Intercompany</h1>
        <p className="mt-1 text-sm text-gray-500">
          Shared invoice splits across entities. Each allocation generates intercompany lines in the Sage export.
        </p>
      </div>

      {/* Interco code reference */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-50 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">INC Codes</h2>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5">
          {(interco ?? []).map((ic: any) => (
            <div
              key={ic.id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-blue-light text-xs font-bold text-brand-blue">
                {ic.code}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{ic.entities?.name}</p>
                <p className="text-[11px] text-gray-400">GL: {ic.gl_account}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocations */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        <div className="border-b border-gray-50 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Allocations</h2>
        </div>
        {!allocations || allocations.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ArrowLeftRight className="h-10 w-10 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">
              No intercompany allocations yet. Split an invoice to see entries here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Invoice</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Entity</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">INC Code</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">GL</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allocations.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-medium text-gray-800">
                    {a.invoices?.description ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{a.entities?.code ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded bg-brand-blue-light px-2 py-0.5 text-xs font-medium text-brand-blue">
                      {a.interco_codes?.code ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{a.gl_account}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                    {formatCurrency(a.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
