export const DOCUMENT_CATEGORIES = [
  { value: "policies", label: "Policies & Procedures" },
  { value: "contracts", label: "Contracts & Agreements" },
  { value: "sage_accounting", label: "Sage & Accounting" },
  { value: "payments_banking", label: "Payment & Banking" },
  { value: "compliance_tax", label: "Compliance & Tax" },
  { value: "hr_payroll", label: "HR & Payroll" },
  { value: "templates", label: "Templates & Forms" },
  { value: "correspondence", label: "Correspondence" },
  { value: "other", label: "Other" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const ACCEPTED_LIBRARY_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const MAX_LIBRARY_FILE_BYTES = 25 * 1024 * 1024;

export function categoryLabel(value: string): string {
  return DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
