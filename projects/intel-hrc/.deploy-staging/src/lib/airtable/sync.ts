/**
 * Airtable sync — push Supabase invoice/payment data to Airtable
 * for operational dashboards and reporting.
 *
 * Airtable is read-mostly: Supabase is source of truth.
 * Sync runs on-demand or via daily cron.
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_API = "https://api.airtable.com/v0";

interface AirtableRecord {
  fields: Record<string, any>;
}

async function airtableRequest(
  table: string,
  method: "GET" | "POST" | "PATCH",
  body?: any
) {
  const url = `${AIRTABLE_API}/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Airtable ${method} ${table}: ${res.status} ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function syncInvoicesToAirtable(invoices: any[]) {
  const records: AirtableRecord[] = invoices.map((inv) => ({
    fields: {
      "Invoice ID": inv.id,
      "Invoice Number": inv.invoice_number ?? "",
      Description: inv.description ?? "",
      Entity: inv.entities?.code ?? "",
      Supplier: inv.suppliers?.name ?? "",
      "Gross Amount": inv.gross_amount,
      "Net Amount": inv.net_amount,
      "VAT Amount": inv.vat_amount,
      "WHT Amount": inv.wht_amount,
      Status: inv.status,
      "Invoice Type": inv.invoice_type,
      "Invoice Date": inv.invoice_date,
      Currency: inv.currency ?? "XAF",
    },
  }));

  // Airtable limits to 10 records per request
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const results = [];
  for (const batch of batches) {
    const result = await airtableRequest("Invoices", "POST", {
      records: batch,
      typecast: true,
    });
    results.push(result);
  }

  return results;
}

export async function syncPaymentsToAirtable(payments: any[]) {
  const records: AirtableRecord[] = payments.map((p) => ({
    fields: {
      "Payment ID": p.id,
      "Invoice ID": p.invoice_id,
      Entity: p.entities?.code ?? "",
      Supplier: p.suppliers?.name ?? "",
      Type: p.payment_type,
      Amount: p.amount,
      "Scheduled Date": p.scheduled_date,
      "Executed Date": p.executed_date,
      "CFO Approved": p.cfo_approved,
    },
  }));

  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  for (const batch of batches) {
    await airtableRequest("Payments", "POST", {
      records: batch,
      typecast: true,
    });
  }
}

export async function syncApprovalStatusToAirtable(approvals: any[]) {
  const records: AirtableRecord[] = approvals.map((a) => ({
    fields: {
      "Approval ID": a.id,
      "Invoice": a.invoices?.description ?? "",
      Entity: a.invoices?.entities?.code ?? "",
      Decision: a.decision,
      "Requested At": a.requested_at,
      "Responded At": a.responded_at,
      "Reminder Count": a.reminder_count,
      "Approver": a.approver_name ?? a.approver_email,
    },
  }));

  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  for (const batch of batches) {
    await airtableRequest("Approvals", "POST", {
      records: batch,
      typecast: true,
    });
  }
}
