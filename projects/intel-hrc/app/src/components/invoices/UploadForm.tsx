"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  defaultPaymentSchedule,
  defaultScheduledDay,
  defaultScheduledWeekday,
  WEEKDAY_LABELS,
  type PaymentSchedule,
} from "@/lib/invoices/payment-schedule";
import { poRequiredForInvoice } from "@/lib/invoices/po-workflow";

interface UploadFormProps {
  entities: any[];
  suppliers: any[];
}

type ConfidenceLevel = "high" | "medium" | "low" | null;

interface FieldMeta {
  confidence: ConfidenceLevel;
  aiSuggested: boolean;
}

const invoiceTypes = [
  { value: "standard", label: "Standard Invoice" },
  { value: "consultancy_wht", label: "Consultancy + WHT" },
  { value: "vat", label: "Invoice with VAT" },
  { value: "intercompany", label: "Intercompany Split" },
  { value: "prepaid_accrual", label: "Prepaid / Accrual" },
];

const confidenceColors: Record<string, string> = {
  high: "text-brand-green border-brand-green/30 bg-brand-green-light",
  medium: "text-amber-600 border-amber-300/50 bg-amber-50",
  low: "text-red-500 border-red-300/50 bg-red-50",
};

export function UploadForm({ entities, suppliers }: UploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [fieldMeta, setFieldMeta] = useState<Record<string, FieldMeta>>({});

  const [form, setForm] = useState({
    entity_id: "",
    supplier_id: "",
    invoice_number: "",
    invoice_date: "",
    description: "",
    invoice_type: "standard",
    gross_amount: "",
    net_amount: "",
    vat_amount: "",
    wht_amount: "",
    expense_account: "",
    po_number: "",
    proforma_number: "",
    payment_channel: "bank",
    is_recurring: false,
    payment_category: "",
    payment_schedule: "monthly" as PaymentSchedule,
    scheduled_payment_day: "15",
    scheduled_payment_weekday: "5",
  });

  function syncPaymentDefaults(
    channel: string,
    recurring: boolean,
    schedule?: PaymentSchedule
  ) {
    const payment_schedule = schedule ?? defaultPaymentSchedule({
      payment_channel: channel,
      is_recurring: recurring,
    });
    return {
      payment_schedule,
      scheduled_payment_day: String(defaultScheduledDay({
        payment_channel: channel,
        is_recurring: recurring,
      })),
      scheduled_payment_weekday: String(
        defaultScheduledWeekday({
          payment_channel: channel,
          is_recurring: recurring,
          payment_schedule,
        }) ?? 5
      ),
    };
  }

  async function runOcr(uploadedFile: File) {
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);

      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      if (!res.ok) return;

      const { extracted } = await res.json();
      if (!extracted) return;

      const updates: Partial<typeof form> = {};
      const meta: Record<string, FieldMeta> = {};

      if (extracted.invoice_number?.value) {
        updates.invoice_number = extracted.invoice_number.value;
        meta.invoice_number = { confidence: extracted.invoice_number.confidence, aiSuggested: true };
      }
      if (extracted.invoice_date?.value) {
        updates.invoice_date = extracted.invoice_date.value;
        meta.invoice_date = { confidence: extracted.invoice_date.confidence, aiSuggested: true };
      }
      if (extracted.description?.value) {
        updates.description = extracted.description.value;
        meta.description = { confidence: extracted.description.confidence, aiSuggested: true };
      }
      if (extracted.gross_amount?.value) {
        updates.gross_amount = String(extracted.gross_amount.value);
        meta.gross_amount = { confidence: extracted.gross_amount.confidence, aiSuggested: true };
      }
      if (extracted.net_amount?.value) {
        updates.net_amount = String(extracted.net_amount.value);
        meta.net_amount = { confidence: extracted.net_amount.confidence, aiSuggested: true };
      }
      if (extracted.vat_amount?.value) {
        updates.vat_amount = String(extracted.vat_amount.value);
        meta.vat_amount = { confidence: extracted.vat_amount.confidence, aiSuggested: true };
      }
      if (extracted.wht_amount?.value) {
        updates.wht_amount = String(extracted.wht_amount.value);
        meta.wht_amount = { confidence: extracted.wht_amount.confidence, aiSuggested: true };
      }
      if (extracted.po_number?.value) {
        updates.po_number = extracted.po_number.value;
        meta.po_number = { confidence: extracted.po_number.confidence, aiSuggested: true };
      }
      if (extracted.suggested_expense_account?.value) {
        updates.expense_account = extracted.suggested_expense_account.value;
        meta.expense_account = { confidence: extracted.suggested_expense_account.confidence, aiSuggested: true };
      }
      if (extracted.suggested_invoice_type?.value) {
        updates.invoice_type = extracted.suggested_invoice_type.value;
        meta.invoice_type = { confidence: extracted.suggested_invoice_type.confidence, aiSuggested: true };
      }

      // Try to match entity from suggestion
      if (extracted.suggested_entity?.value) {
        const match = entities.find(
          (e: any) => e.code === extracted.suggested_entity.value
        );
        if (match) {
          updates.entity_id = match.id;
          meta.entity_id = { confidence: extracted.suggested_entity.confidence, aiSuggested: true };
        }
      }

      // Try to match supplier by name
      if (extracted.supplier_name?.value) {
        const name = extracted.supplier_name.value.toLowerCase();
        const match = suppliers.find(
          (s: any) => s.name.toLowerCase().includes(name) || name.includes(s.name.toLowerCase())
        );
        if (match) {
          updates.supplier_id = match.id;
          meta.supplier_id = { confidence: extracted.supplier_name.confidence, aiSuggested: true };
        }
      }

      setForm((prev) => ({ ...prev, ...updates }));
      setFieldMeta(meta);
    } catch {
      // OCR failed silently — user can still fill manually
    } finally {
      setExtracting(false);
    }
  }

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      runOcr(accepted[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, suppliers]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const filteredSuppliers = form.entity_id
    ? suppliers.filter((s: any) => s.entity_id === form.entity_id)
    : suppliers;

  const selectedEntity = entities.find((e: any) => e.id === form.entity_id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gross_amount: parseInt(form.gross_amount) || 0,
          net_amount: parseInt(form.net_amount) || 0,
          vat_amount: parseInt(form.vat_amount) || 0,
          wht_amount: parseInt(form.wht_amount) || 0,
          is_recurring: form.is_recurring,
          payment_channel: form.payment_channel,
          payment_category: form.payment_category || null,
          proforma_number: form.proforma_number || null,
          payment_schedule: form.payment_schedule,
          scheduled_payment_day: parseInt(form.scheduled_payment_day, 10) || 15,
          scheduled_payment_weekday:
            form.payment_schedule === "weekly"
              ? parseInt(form.scheduled_payment_weekday, 10)
              : null,
          po_number: form.is_recurring ? null : form.po_number || null,
        }),
      });

      if (res.ok) {
        const { id } = await res.json();

        // Upload file to storage if present
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("invoice_id", id);
          await fetch("/api/invoices/upload", { method: "POST", body: fd });
        }

        setSubmitted(true);
        setTimeout(() => router.push(`/invoices/${id}`), 1200);
      }
    } catch {
      // handle error
    } finally {
      setUploading(false);
    }
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File upload zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragActive
            ? "border-brand-blue bg-brand-blue-light"
            : file
            ? extracting
              ? "border-brand-blue bg-brand-blue-light"
              : "border-brand-green bg-brand-green-light"
            : "border-gray-200 bg-white hover:border-brand-blue/40 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              {extracting ? (
                <>
                  <div className="relative">
                    <Sparkles className="h-10 w-10 text-brand-blue animate-pulse" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-brand-blue">
                    AI is reading the invoice...
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Extracting fields automatically
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-10 w-10 text-brand-green" />
                  <p className="mt-3 text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                    {Object.keys(fieldMeta).length > 0 && (
                      <span className="ml-2 text-brand-blue">
                        · {Object.keys(fieldMeta).length} fields auto-filled
                      </span>
                    )}
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setFieldMeta({});
                }}
                className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <Upload className="h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-600">
                Drop invoice here, or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PDF, PNG, JPG up to 10 MB · AI will auto-fill fields
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form fields */}
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <h2 className="mb-5 text-sm font-semibold text-gray-800">Invoice Details</h2>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <FieldSelect
            label="Entity"
            value={form.entity_id}
            onChange={(v) => update("entity_id", v)}
            options={entities.map((e: any) => ({ value: e.id, label: `${e.code} — ${e.name}` }))}
            required
            meta={fieldMeta.entity_id}
          />
          <FieldSelect
            label="Invoice Type"
            value={form.invoice_type}
            onChange={(v) => update("invoice_type", v)}
            options={invoiceTypes}
            meta={fieldMeta.invoice_type}
          />
          <FieldSelect
            label="Supplier"
            value={form.supplier_id}
            onChange={(v) => update("supplier_id", v)}
            options={filteredSuppliers.map((s: any) => ({
              value: s.id,
              label: `${s.name} (${s.aux_code})`,
            }))}
            meta={fieldMeta.supplier_id}
          />
          <FieldInput label="Invoice Number" value={form.invoice_number} onChange={(v) => update("invoice_number", v)} meta={fieldMeta.invoice_number} />
          <FieldInput label="Invoice Date" value={form.invoice_date} onChange={(v) => update("invoice_date", v)} type="date" required meta={fieldMeta.invoice_date} />
          {!form.is_recurring && (
            <FieldInput
              label="Proforma # (if received)"
              value={form.proforma_number}
              onChange={(v) => update("proforma_number", v)}
            />
          )}
          {poRequiredForInvoice({ is_recurring: form.is_recurring }) ? (
            <div className="col-span-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-800">
              One-off payment — PO is required. After intake, create PO from proforma on the invoice detail page and match before approval.
            </div>
          ) : (
            <div className="col-span-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-xs text-blue-800">
              Recurring invoice — PO matching is not required.
            </div>
          )}
          <div className="col-span-2">
            <FieldInput label="Description" value={form.description} onChange={(v) => update("description", v)} meta={fieldMeta.description} />
          </div>
          <FieldInput label="Gross Amount (FCFA)" value={form.gross_amount} onChange={(v) => update("gross_amount", v)} type="number" required meta={fieldMeta.gross_amount} />
          <FieldInput label="Net Amount (FCFA)" value={form.net_amount} onChange={(v) => update("net_amount", v)} type="number" meta={fieldMeta.net_amount} />
          {(form.invoice_type === "vat" || form.invoice_type === "standard") && (
            <FieldInput label="VAT Amount" value={form.vat_amount} onChange={(v) => update("vat_amount", v)} type="number" meta={fieldMeta.vat_amount} />
          )}
          {form.invoice_type === "consultancy_wht" && (
            <FieldInput label="WHT Amount" value={form.wht_amount} onChange={(v) => update("wht_amount", v)} type="number" meta={fieldMeta.wht_amount} />
          )}
          <FieldInput label="Expense Account" value={form.expense_account} onChange={(v) => update("expense_account", v)} placeholder={selectedEntity ? `e.g. ${"6324400".slice(0, selectedEntity.account_digits)}` : "e.g. 6324400"} meta={fieldMeta.expense_account} />
        </div>

        {/* Payment routing */}
        <div className="mt-5 border-t border-gray-100 pt-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Payment Routing</h3>
          <div className="grid grid-cols-3 gap-x-5 gap-y-4">
            <FieldSelect
              label="Payment Channel"
              value={form.payment_channel}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  payment_channel: v,
                  ...syncPaymentDefaults(v, p.is_recurring),
                }))
              }
              options={[
                { value: "bank", label: "Bank Transfer (monthly)" },
                { value: "maviance", label: "Maviance e-wallet (weekly)" },
              ]}
            />
            <FieldSelect
              label="Category"
              value={form.payment_category}
              onChange={(v) => setForm((p) => ({ ...p, payment_category: v }))}
              options={[
                "Rent", "Telecom", "Security", "Consultancy", "Software",
                "Office Supplies", "Insurance", "Legal / Accounting",
                "Utilities", "Transport / Logistics", "Marketing / Events", "Other",
              ].map((c) => ({ value: c, label: c }))}
            />
            <label className="flex flex-col justify-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">Recurring Invoice</span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    is_recurring: !p.is_recurring,
                    ...syncPaymentDefaults(p.payment_channel, !p.is_recurring),
                  }))
                }
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  form.is_recurring
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-500"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-sm border-2 flex items-center justify-center",
                  form.is_recurring ? "border-blue-500 bg-blue-500" : "border-gray-300"
                )}>
                  {form.is_recurring && <span className="text-white text-[10px] font-bold">✓</span>}
                </div>
                {form.is_recurring ? "Monthly recurring" : "One-off"}
              </button>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-x-5 gap-y-4">
            <FieldSelect
              label="Payment Schedule"
              value={form.payment_schedule}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  ...syncPaymentDefaults(p.payment_channel, p.is_recurring, v as PaymentSchedule),
                }))
              }
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
            {form.payment_schedule === "monthly" ? (
              <FieldInput
                label="Day of month"
                value={form.scheduled_payment_day}
                onChange={(v) => update("scheduled_payment_day", v)}
                type="number"
              />
            ) : (
              <FieldSelect
                label="Weekday"
                value={form.scheduled_payment_weekday}
                onChange={(v) => update("scheduled_payment_weekday", v)}
                options={WEEKDAY_LABELS.map((label, i) => ({ value: String(i), label }))}
              />
            )}
            <div className="flex items-end">
              <p className="text-[11px] text-gray-500 pb-2">
                {form.payment_channel === "bank"
                  ? "Default: monthly on the 15th for supplier bank runs"
                  : "Default: weekly on Friday for one-off e-wallet payments"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Entity + journal info pill */}
      {selectedEntity && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-3.5 w-3.5" />
          Journal: <span className="font-medium text-gray-700">{selectedEntity.purchase_journal}</span>
          · Sage folder: <span className="font-medium text-gray-700">{selectedEntity.sage_folder}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading || submitted || !form.entity_id || !form.invoice_date}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-colors",
          submitted
            ? "bg-brand-green"
            : "bg-brand-blue hover:bg-brand-blue-deep disabled:bg-gray-300"
        )}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : submitted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {submitted ? "Invoice Created" : uploading ? "Saving..." : "Create Invoice"}
      </button>
    </form>
  );
}

function ConfidenceDot({ level }: { level: ConfidenceLevel }) {
  if (!level) return null;
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        confidenceColors[level]
      )}
      title={`AI confidence: ${level}`}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {level}
    </span>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  meta,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  meta?: FieldMeta;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
        {label}
        {meta?.aiSuggested && <ConfidenceDot level={meta.confidence} />}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20",
          meta?.aiSuggested
            ? "border-brand-blue/30 bg-brand-blue-light/30"
            : "border-gray-200"
        )}
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  required,
  meta,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  meta?: FieldMeta;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center text-xs font-medium text-gray-500">
        {label}
        {meta?.aiSuggested && <ConfidenceDot level={meta.confidence} />}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-brand-blue",
          meta?.aiSuggested
            ? "border-brand-blue/30 bg-brand-blue-light/30"
            : "border-gray-200"
        )}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
