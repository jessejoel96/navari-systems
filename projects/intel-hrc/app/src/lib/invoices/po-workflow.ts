/**
 * PO workflow rules — recurring invoices skip PO; one-off requires PO match before approval.
 */

export function poRequiredForInvoice(invoice: {
  is_recurring?: boolean | null;
}): boolean {
  return !invoice.is_recurring;
}

export function canApproveWithoutPo(invoice: {
  is_recurring?: boolean | null;
  po_matched?: boolean | null;
  purchase_order_id?: string | null;
}): boolean {
  if (!poRequiredForInvoice(invoice)) return true;
  return Boolean(invoice.po_matched && invoice.purchase_order_id);
}

export const PO_WORKFLOW_STEPS = [
  { step: 1, label: "Proforma received", status: "proforma_received" },
  { step: 2, label: "PO created from proforma", status: "po_created" },
  { step: 3, label: "PO sent to supplier", status: "po_sent" },
  { step: 4, label: "Supplier invoice received", status: "invoice_received" },
  { step: 5, label: "Invoice matched to PO", status: "matched" },
] as const;
