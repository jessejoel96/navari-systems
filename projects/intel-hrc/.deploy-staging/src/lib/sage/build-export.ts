import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generateLines,
  toSageTxt,
  validateBalance,
  type InvoiceForSage,
  type SageLine,
  type IntercoAllocation,
} from "@/lib/sage/generator";
import { sageDateFormat } from "@/lib/utils";

export interface SageExportBuild {
  invoiceId: string;
  entityId: string;
  entityCode: string;
  sageFolder: string;
  journal: string;
  fileName: string;
  lines: SageLine[];
  txt: string;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  supplierName: string;
}

type InvoiceRow = {
  id: string;
  entity_id: string;
  invoice_type: InvoiceForSage["invoiceType"];
  invoice_date: string;
  expense_account: string | null;
  label: string | null;
  description: string | null;
  gross_amount: number;
  net_amount: number | null;
  vat_amount: number | null;
  wht_amount: number | null;
  vat_account: string | null;
  wht_account: string | null;
  entities: {
    code: string;
    sage_folder: string;
    purchase_journal: string;
  } | null;
  suppliers: {
    name: string;
    aux_code: string;
    supplier_account: string;
  } | null;
};

function normalizeInvoiceRow(data: Record<string, unknown>): InvoiceRow {
  const entities = data.entities;
  const suppliers = data.suppliers;
  return {
    ...(data as unknown as InvoiceRow),
    entities: (Array.isArray(entities) ? entities[0] : entities) as InvoiceRow["entities"],
    suppliers: (Array.isArray(suppliers) ? suppliers[0] : suppliers) as InvoiceRow["suppliers"],
  };
}

export async function buildSageExportForInvoice(
  supabase: SupabaseClient,
  invoiceId: string,
  invoiceRow?: InvoiceRow
): Promise<SageExportBuild> {
  let invoice = invoiceRow;

  if (!invoice) {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, entity_id, invoice_type, invoice_date, expense_account, label, description, gross_amount, net_amount, vat_amount, wht_amount, vat_account, wht_account, entities(code, sage_folder, purchase_journal), suppliers(name, aux_code, supplier_account)"
      )
      .eq("id", invoiceId)
      .single();

    if (error || !data) {
      throw new Error("Invoice not found");
    }
    invoice = normalizeInvoiceRow(data);
  }

  const entity = Array.isArray(invoice.entities) ? invoice.entities[0] : invoice.entities;
  const supplier = Array.isArray(invoice.suppliers) ? invoice.suppliers[0] : invoice.suppliers;

  if (!entity?.purchase_journal) {
    throw new Error("Entity journal not configured");
  }

  if (!invoice.invoice_date) {
    throw new Error("Invoice date is required for Sage export");
  }

  const inv: InvoiceForSage = {
    invoiceType: invoice.invoice_type,
    journal: entity.purchase_journal,
    date: sageDateFormat(new Date(invoice.invoice_date)),
    supplierAux: supplier?.aux_code ?? "",
    supplierAccount: supplier?.supplier_account ?? "4011000",
    expenseAccount: invoice.expense_account ?? "6324400",
    label: invoice.label ?? invoice.description ?? "Invoice",
    grossAmount: invoice.gross_amount,
    netAmount: invoice.net_amount || invoice.gross_amount,
    vatAmount: invoice.vat_amount || 0,
    whtAmount: invoice.wht_amount || 0,
    vatAccount: invoice.vat_account ?? undefined,
    whtAccount: invoice.wht_account ?? undefined,
  };

  let allocations: IntercoAllocation[] | undefined;
  let entityShare: number | undefined;

  if (invoice.invoice_type === "intercompany") {
    const { data: allocs } = await supabase
      .from("intercompany_allocations")
      .select("amount, gl_account, interco_codes(code)")
      .eq("invoice_id", invoiceId);

    allocations = (allocs ?? []).map((a: { amount: number; gl_account: string; interco_codes: { code: string } | { code: string }[] | null }) => {
      const interco = Array.isArray(a.interco_codes) ? a.interco_codes[0] : a.interco_codes;
      return {
        intercoCode: interco?.code ?? "",
        amount: a.amount,
        glAccount: a.gl_account,
      };
    });

    const allocTotal = allocations.reduce((sum, a) => sum + a.amount, 0);
    entityShare = invoice.gross_amount - allocTotal;
  }

  const lines = generateLines(inv, allocations, entityShare);
  const { balanced, totalDebit, totalCredit } = validateBalance(lines);

  const supplierLabel = (supplier?.name ?? "INV").replace(/[^\w\s-]/g, "").trim();
  const fileName = `UPLOAD ${supplierLabel}-${entity.code}.txt`;

  return {
    invoiceId: invoice.id,
    entityId: invoice.entity_id,
    entityCode: entity.code,
    sageFolder: entity.sage_folder,
    journal: entity.purchase_journal,
    fileName,
    lines,
    txt: toSageTxt(lines),
    totalDebit,
    totalCredit,
    balanced,
    supplierName: supplier?.name ?? "Unknown",
  };
}

export async function buildSageBatchExport(
  supabase: SupabaseClient,
  invoiceIds: string[]
): Promise<{
  builds: SageExportBuild[];
  combinedTxt: string;
  fileName: string;
  entityCode: string;
  sageFolder: string;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}> {
  if (invoiceIds.length === 0) {
    throw new Error("No invoices selected");
  }

  const builds: SageExportBuild[] = [];
  for (const id of invoiceIds) {
    builds.push(await buildSageExportForInvoice(supabase, id));
  }

  const entityCodes = [...new Set(builds.map((b) => b.entityCode))];
  if (entityCodes.length > 1) {
    throw new Error("Batch export must be for a single entity");
  }

  const allLines = builds.flatMap((b) => b.lines);
  const combinedTxt = toSageTxt(allLines);
  const { balanced, totalDebit, totalCredit } = validateBalance(allLines);

  const first = builds[0];
  const fileName = `UPLOAD BATCH-${first.entityCode}-${builds.length}inv.txt`;

  return {
    builds,
    combinedTxt,
    fileName,
    entityCode: first.entityCode,
    sageFolder: first.sageFolder,
    totalDebit,
    totalCredit,
    balanced,
  };
}
