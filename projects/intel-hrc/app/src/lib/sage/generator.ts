/**
 * Sage 100 Comptabilite .txt import file generator.
 *
 * 8 tab-separated columns, no header row.
 * Col: Journal | Date | Aux(Dr) | Account | Aux(Cr) | Label | Debit | Credit
 *
 * Balance rule: total debits = total credits per entry group.
 */

export interface SageLine {
  journal: string;
  date: string; // DD/MM/YYYY
  auxDebit: string;
  account: string;
  auxCredit: string;
  label: string;
  debit: number | null;
  credit: number | null;
}

export interface InvoiceForSage {
  invoiceType: "consultancy_wht" | "vat" | "intercompany" | "prepaid_accrual" | "standard";
  journal: string;
  date: string; // DD/MM/YYYY
  supplierAux: string;
  supplierAccount: string;
  expenseAccount: string;
  label: string;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
  whtAmount: number;
  vatAccount?: string;
  whtAccount?: string;
}

export interface IntercoAllocation {
  intercoCode: string; // INC03
  amount: number;
  glAccount: string; // 4612000
}

// Pattern A: Consultancy + WHT (ACH)
// Dr expense (gross), Cr WHT, Cr supplier (net)
// Supplier aux on col 5 for all 3 lines
export function generateConsultancyWHT(inv: InvoiceForSage): SageLine[] {
  const whtAccount = inv.whtAccount || "4472700";
  return [
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.expenseAccount,
      auxCredit: inv.supplierAux,
      label: inv.label,
      debit: inv.grossAmount,
      credit: null,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: whtAccount,
      auxCredit: inv.supplierAux,
      label: inv.label,
      debit: null,
      credit: inv.whtAmount,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.supplierAccount,
      auxCredit: inv.supplierAux,
      label: inv.label,
      debit: null,
      credit: inv.netAmount,
    },
  ];
}

// Pattern D: Supplier invoice with VAT (PURC for HQ, ACH for IOS)
// Dr expense (net), Dr VAT, Cr supplier (gross)
// Supplier aux on col 5 for the credit line only
export function generateVATInvoice(inv: InvoiceForSage): SageLine[] {
  const vatAccount = inv.vatAccount || "44520000";
  return [
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.expenseAccount,
      auxCredit: "",
      label: inv.label,
      debit: inv.netAmount,
      credit: null,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: vatAccount,
      auxCredit: "",
      label: inv.label,
      debit: inv.vatAmount,
      credit: null,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.supplierAccount,
      auxCredit: inv.supplierAux,
      label: inv.label,
      debit: null,
      credit: inv.grossAmount,
    },
  ];
}

// Pattern B: Intercompany split (ACH)
// Dr expense (entity share), Dr 4612000 with INCxx for each allocation, Cr supplier (total)
export function generateIntercompanySplit(
  inv: InvoiceForSage,
  entityShare: number,
  allocations: IntercoAllocation[]
): SageLine[] {
  const lines: SageLine[] = [];

  // Local entity expense
  lines.push({
    journal: inv.journal,
    date: inv.date,
    auxDebit: "",
    account: inv.expenseAccount,
    auxCredit: "",
    label: inv.label,
    debit: entityShare,
    credit: null,
  });

  // Interco allocations
  for (const alloc of allocations) {
    lines.push({
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: alloc.glAccount,
      auxCredit: alloc.intercoCode,
      label: inv.label,
      debit: alloc.amount,
      credit: null,
    });
  }

  // Supplier credit (total)
  lines.push({
    journal: inv.journal,
    date: inv.date,
    auxDebit: "",
    account: inv.supplierAccount,
    auxCredit: inv.supplierAux,
    label: inv.label,
    debit: null,
    credit: inv.grossAmount,
  });

  return lines;
}

// Pattern C: Prepaid / accrual (OPD)
// Dr expense, Cr 4761000
export function generatePrepaidAccrual(inv: InvoiceForSage): SageLine[] {
  return [
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.expenseAccount,
      auxCredit: "",
      label: inv.label,
      debit: inv.grossAmount,
      credit: null,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: "4761000",
      auxCredit: "",
      label: inv.label,
      debit: null,
      credit: inv.grossAmount,
    },
  ];
}

// Pattern E: Standard (no VAT, no WHT)
// Dr expense, Cr supplier
export function generateStandard(inv: InvoiceForSage): SageLine[] {
  return [
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.expenseAccount,
      auxCredit: "",
      label: inv.label,
      debit: inv.grossAmount,
      credit: null,
    },
    {
      journal: inv.journal,
      date: inv.date,
      auxDebit: "",
      account: inv.supplierAccount,
      auxCredit: inv.supplierAux,
      label: inv.label,
      debit: null,
      credit: inv.grossAmount,
    },
  ];
}

export function toSageTxt(lines: SageLine[]): string {
  return lines
    .map((l) =>
      [
        l.journal,
        l.date,
        l.auxDebit,
        l.account,
        l.auxCredit,
        l.label,
        l.debit != null ? l.debit.toString() : "",
        l.credit != null ? l.credit.toString() : "",
      ].join("\t")
    )
    .join("\r\n");
}

export function validateBalance(lines: SageLine[]): {
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
} {
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
  return { balanced: totalDebit === totalCredit, totalDebit, totalCredit };
}

export function generateLines(
  inv: InvoiceForSage,
  allocations?: IntercoAllocation[],
  entityShare?: number
): SageLine[] {
  switch (inv.invoiceType) {
    case "consultancy_wht":
      return generateConsultancyWHT(inv);
    case "vat":
      return generateVATInvoice(inv);
    case "intercompany":
      return generateIntercompanySplit(inv, entityShare ?? 0, allocations ?? []);
    case "prepaid_accrual":
      return generatePrepaidAccrual(inv);
    case "standard":
    default:
      return generateStandard(inv);
  }
}
