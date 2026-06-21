import { createServiceClient } from "@/lib/supabase/server";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = createServiceClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, aux_code, supplier_account, email, tax_id, is_active, entities(name, code)")
    .order("name");

  const grouped = (suppliers ?? []).reduce((acc: Record<string, any[]>, s: any) => {
    const code = s.entities?.code ?? "Unknown";
    if (!acc[code]) acc[code] = [];
    acc[code].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
        <p className="mt-1 text-sm text-gray-500">
          {suppliers?.length ?? 0} suppliers across all entities. Auxiliary codes match Sage structure.
        </p>
      </div>

      {Object.entries(grouped).map(([entityCode, entitySuppliers]) => (
        <div key={entityCode} className="rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-3 border-b border-gray-50 px-5 py-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-green-light text-xs font-semibold text-brand-green">
              {entityCode.slice(0, 2)}
            </span>
            <h2 className="text-sm font-semibold text-gray-800">
              {entityCode}
            </h2>
            <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {(entitySuppliers as any[]).length}
            </span>
          </div>
          <ul className="divide-y divide-gray-50">
            {(entitySuppliers as any[]).map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                  <Users className="h-4 w-4 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.email ?? "No email"}
                  </p>
                </div>
                <span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-600">
                  {s.aux_code}
                </span>
                <span className="text-xs text-gray-400">{s.supplier_account}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
