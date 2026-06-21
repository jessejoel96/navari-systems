/**
 * Prepaid expense Sage .txt generation — AP scope only (ends at Sage import).
 *
 * Step 1 (initial booking, ACH/PURC):
 *   No VAT:  Dr 476xx / Cr 401 (+ supplier aux)
 *   With VAT: Dr 476xx (net) + Dr 445xx / Cr 401 (gross)
 *
 * Step 2 (monthly release, OPD on 22nd):
 *   rent/company: Dr 6xx / Cr 476xx
 *   client:       Dr 4711 / Cr 47602
 */

import { type SageLine, toSageTxt, validateBalance } from "./generator";

export type PrepaidCategory = "rent" | "company" | "client";

export const PREPAID_ACCOUNT_BY_CATEGORY: Record<PrepaidCategory, string> = {
  rent: "47601",
  company: "47603",
  client: "47602",
};

export const DEFAULT_RELEASE_BY_CATEGORY: Record<PrepaidCategory, string> = {
  rent: "6222100",
  company: "6251100",
  client: "4711",
};

export interface PrepaidContractForSage {
  label: string;
  prepaidAccount: string;
  releaseAccount: string;
  supplierAccount: string;
  supplierAux: string;
  purchaseJournal: string;
  releaseJournal: string;
  invoiceDate: string; // DD/MM/YYYY
  totalAmount: number;
  netAmount: number;
  vatAmount: number;
  vatAccount: string;
  hasVat: boolean;
}

export interface PrepaidScheduleLineForSage {
  scheduledDate: string; // DD/MM/YYYY
  amount: number;
  label: string;
}

/** Pad account to entity digit length (HQ=8, IOS often 7). */
export function padAccount(base: string, digits: number): string {
  const n = base.replace(/\D/g, "");
  if (n.length >= digits) return n.slice(0, digits);
  return n.padEnd(digits, "0");
}

export function prepaidAccountForCategory(
  category: PrepaidCategory,
  accountDigits: number,
  override?: string
): string {
  const base = override ?? PREPAID_ACCOUNT_BY_CATEGORY[category];
  return padAccount(base, accountDigits);
}

export function releaseAccountForCategory(
  category: PrepaidCategory,
  expenseAccount?: string | null
): string {
  if (expenseAccount) return expenseAccount;
  return DEFAULT_RELEASE_BY_CATEGORY[category];
}

/** Step 1 — capitalize prepaid asset when annual invoice is booked. */
export function generatePrepaidInitialBooking(c: PrepaidContractForSage): SageLine[] {
  if (c.hasVat && c.vatAmount > 0) {
    const net = c.netAmount || c.totalAmount - c.vatAmount;
    return [
      {
        journal: c.purchaseJournal,
        date: c.invoiceDate,
        auxDebit: "",
        account: c.prepaidAccount,
        auxCredit: "",
        label: c.label,
        debit: net,
        credit: null,
      },
      {
        journal: c.purchaseJournal,
        date: c.invoiceDate,
        auxDebit: "",
        account: c.vatAccount || "44520000",
        auxCredit: "",
        label: c.label,
        debit: c.vatAmount,
        credit: null,
      },
      {
        journal: c.purchaseJournal,
        date: c.invoiceDate,
        auxDebit: "",
        account: c.supplierAccount,
        auxCredit: c.supplierAux,
        label: c.label,
        debit: null,
        credit: c.totalAmount,
      },
    ];
  }

  // Insurance / no-VAT: Dr 476 / Cr 401 only
  return [
    {
      journal: c.purchaseJournal,
      date: c.invoiceDate,
      auxDebit: "",
      account: c.prepaidAccount,
      auxCredit: "",
      label: c.label,
      debit: c.totalAmount,
      credit: null,
    },
    {
      journal: c.purchaseJournal,
      date: c.invoiceDate,
      auxDebit: "",
      account: c.supplierAccount,
      auxCredit: c.supplierAux,
      label: c.label,
      debit: null,
      credit: c.totalAmount,
    },
  ];
}

/** Step 2 — monthly OPD release (22nd). */
export function generatePrepaidMonthlyRelease(
  c: Pick<PrepaidContractForSage, "prepaidAccount" | "releaseAccount" | "releaseJournal">,
  line: PrepaidScheduleLineForSage
): SageLine[] {
  return [
    {
      journal: c.releaseJournal,
      date: line.scheduledDate,
      auxDebit: "",
      account: c.releaseAccount,
      auxCredit: "",
      label: line.label,
      debit: line.amount,
      credit: null,
    },
    {
      journal: c.releaseJournal,
      date: line.scheduledDate,
      auxDebit: "",
      account: c.prepaidAccount,
      auxCredit: "",
      label: line.label,
      debit: null,
      credit: line.amount,
    },
  ];
}

export function generatePrepaidMonthlyBatch(
  contracts: Array<{
    contract: Pick<PrepaidContractForSage, "prepaidAccount" | "releaseAccount" | "releaseJournal">;
    line: PrepaidScheduleLineForSage;
  }>
): SageLine[] {
  return contracts.flatMap(({ contract, line }) =>
    generatePrepaidMonthlyRelease(contract, line)
  );
}

export function buildPrepaidTxt(lines: SageLine[]): {
  txt: string;
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
} {
  const { balanced, totalDebit, totalCredit } = validateBalance(lines);
  return { txt: toSageTxt(lines), balanced, totalDebit, totalCredit };
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Build 12 equal monthly lines from coverage period. Posts on `postDay` (default 22). */
export function buildMonthlySchedule(input: {
  label: string;
  totalAmount: number;
  coverageStart: Date;
  coverageEnd: Date;
  postDay?: number;
}): Array<{
  periodMonth: number;
  periodYear: number;
  scheduledDate: string;
  amount: number;
  label: string;
}> {
  const postDay = input.postDay ?? 22;
  const start = input.coverageStart;
  const end = input.coverageEnd;

  const months: Array<{ month: number; year: number }> = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endMonth) {
    months.push({ month: cur.getMonth() + 1, year: cur.getFullYear() });
    cur.setMonth(cur.getMonth() + 1);
  }

  const count = months.length || 12;
  const baseAmount = Math.floor(input.totalAmount / count);
  let remainder = input.totalAmount - baseAmount * count;

  return months.map(({ month, year }, idx) => {
    const amount = baseAmount + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.min(postDay, daysInMonth);
    const scheduledDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    const monthLabel = `${MONTH_SHORT[month - 1]}-${String(year).slice(-2)}`;

    return {
      periodMonth: month,
      periodYear: year,
      scheduledDate,
      amount,
      label: `${input.label} ${monthLabel}`,
    };
  });
}

export function sageDateFromIso(iso: string): string {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}
