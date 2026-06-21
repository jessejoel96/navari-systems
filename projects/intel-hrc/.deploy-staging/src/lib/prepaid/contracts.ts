import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildMonthlySchedule,
  prepaidAccountForCategory,
  releaseAccountForCategory,
  sageDateFromIso,
  type PrepaidCategory,
} from "@/lib/sage/prepaid";

export type PrepaidContractInput = {
  entity_id: string;
  supplier_id?: string;
  source_invoice_id?: string;
  label: string;
  description?: string;
  prepaid_category: PrepaidCategory;
  prepaid_account?: string;
  release_account?: string;
  coverage_start: string;
  coverage_end: string;
  total_amount: number;
  net_amount?: number;
  vat_amount?: number;
  vat_account?: string;
  has_vat?: boolean;
  expense_account?: string;
  monthly_post_day?: number;
  notes?: string;
};

export async function createPrepaidContract(
  supabase: SupabaseClient,
  input: PrepaidContractInput
) {
  const { data: entity } = await supabase
    .from("entities")
    .select("id, code, purchase_journal, general_journal, account_digits")
    .eq("id", input.entity_id)
    .single();

  if (!entity) throw new Error("Entity not found");

  let supplierAccount = "4011000";
  let supplierAux = "";

  if (input.supplier_id) {
    const { data: supplier } = await supabase
      .from("suppliers")
      .select("aux_code, supplier_account")
      .eq("id", input.supplier_id)
      .single();
    if (supplier) {
      supplierAccount = supplier.supplier_account ?? supplierAccount;
      supplierAux = supplier.aux_code ?? "";
    }
  }

  const digits = entity.account_digits ?? 7;
  const category = input.prepaid_category;
  const prepaidAccount = input.prepaid_account
    ?? prepaidAccountForCategory(category, digits);
  const releaseAccount = input.release_account
    ?? releaseAccountForCategory(category, input.expense_account);

  const { data: contract, error } = await supabase
    .from("prepaid_contracts")
    .insert({
      entity_id: input.entity_id,
      supplier_id: input.supplier_id ?? null,
      source_invoice_id: input.source_invoice_id ?? null,
      label: input.label,
      description: input.description ?? null,
      prepaid_category: category,
      prepaid_account: prepaidAccount,
      release_account: releaseAccount,
      supplier_account: supplierAccount,
      supplier_aux: supplierAux,
      coverage_start: input.coverage_start,
      coverage_end: input.coverage_end,
      total_amount: input.total_amount,
      net_amount: input.net_amount ?? (input.has_vat ? input.total_amount - (input.vat_amount ?? 0) : input.total_amount),
      vat_amount: input.vat_amount ?? 0,
      vat_account: input.vat_account ?? null,
      has_vat: input.has_vat ?? false,
      purchase_journal: entity.purchase_journal ?? "ACH",
      release_journal: entity.general_journal ?? "OPD",
      monthly_post_day: input.monthly_post_day ?? 22,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await generateScheduleForContract(supabase, contract.id);

  return contract;
}

export async function generateScheduleForContract(
  supabase: SupabaseClient,
  contractId: string
) {
  const { data: contract } = await supabase
    .from("prepaid_contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  if (!contract) throw new Error("Contract not found");

  await supabase.from("prepaid_schedule_lines").delete().eq("contract_id", contractId);

  const schedule = buildMonthlySchedule({
    label: contract.label,
    totalAmount: contract.total_amount,
    coverageStart: new Date(contract.coverage_start),
    coverageEnd: new Date(contract.coverage_end),
    postDay: contract.monthly_post_day ?? 22,
  });

  if (schedule.length === 0) throw new Error("Could not build schedule");

  await supabase.from("prepaid_schedule_lines").insert(
    schedule.map((s) => ({
      contract_id: contractId,
      period_month: s.periodMonth,
      period_year: s.periodYear,
      scheduled_date: `${s.periodYear}-${String(s.periodMonth).padStart(2, "0")}-${s.scheduledDate.split("/")[0]}`,
      amount: s.amount,
      label: s.label,
      status: "planned",
    }))
  );

  return schedule;
}

export function contractToSageInput(
  contract: Record<string, unknown>,
  invoiceDateIso?: string
) {
  return {
    label: contract.label as string,
    prepaidAccount: contract.prepaid_account as string,
    releaseAccount: contract.release_account as string,
    supplierAccount: (contract.supplier_account as string) || "4011000",
    supplierAux: (contract.supplier_aux as string) || "",
    purchaseJournal: (contract.purchase_journal as string) || "ACH",
    releaseJournal: (contract.release_journal as string) || "OPD",
    invoiceDate: invoiceDateIso
      ? sageDateFromIso(invoiceDateIso)
      : sageDateFromIso(contract.coverage_start as string),
    totalAmount: contract.total_amount as number,
    netAmount: (contract.net_amount as number) ?? (contract.total_amount as number),
    vatAmount: (contract.vat_amount as number) ?? 0,
    vatAccount: (contract.vat_account as string) || "44520000",
    hasVat: Boolean(contract.has_vat),
  };
}
