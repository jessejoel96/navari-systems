"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Upload, CheckCircle, FileSpreadsheet, AlertCircle } from "lucide-react";

type DocType = "cash_request" | "justification";
type UploadState = "idle" | "uploading" | "success" | "error";

function UploadPanel({
  type,
  title,
  subtitle,
  instructions,
  accentColor,
  endpoint,
}: {
  type: DocType;
  title: string;
  subtitle: string;
  instructions: string[];
  accentColor: { bg: string; btn: string; icon: string };
  endpoint: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [result, setResult] = useState<{ total_amount?: number; total_expenses?: number; lines?: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleSubmit() {
    if (!file) return;
    setState("uploading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setResult({
        total_amount: data.total_amount,
        total_expenses: data.total_expenses,
        lines: data.line_items_parsed ?? data.lines_parsed,
      });
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6 text-center">
        <div className={`w-12 h-12 rounded-full ${accentColor.bg} flex items-center justify-center mx-auto mb-3`}>
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <p className="font-semibold text-slate-800">{title} Received</p>
        {result && (
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            {result.total_amount !== undefined && result.total_amount > 0 && (
              <p>Total: {result.total_amount.toLocaleString("fr-FR")} XAF</p>
            )}
            {result.total_expenses !== undefined && result.total_expenses > 0 && (
              <p>Total expenses: {result.total_expenses.toLocaleString("fr-FR")} XAF</p>
            )}
            {result.lines !== undefined && <p>{result.lines} line items parsed</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{subtitle}</p>

      <div className={`border border-l-4 ${accentColor.icon} rounded-lg p-3 mb-4 text-xs text-slate-600`}>
        <p className="font-semibold mb-1">Include:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {instructions.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
        onClick={() => document.getElementById(`cr-file-${type}`)?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all mb-3
          ${dragging ? "border-blue-400 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}
        `}
      >
        <input
          id={`cr-file-${type}`}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex flex-col items-center gap-1">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <p className="text-sm font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB — click to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload className="w-7 h-7 text-slate-400" />
            <p className="text-sm text-slate-500">Drop file or click to browse</p>
            <p className="text-xs text-slate-400">.xlsx, .xls, .csv, .pdf</p>
          </div>
        )}
      </div>

      {state === "error" && (
        <div className="flex items-center gap-2 text-red-700 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errorMsg}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!file || state === "uploading"}
        className={`w-full ${accentColor.btn} text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors`}
      >
        {state === "uploading" ? "Uploading…" : `Submit ${title}`}
      </button>
    </div>
  );
}

export default function CashRequestSubmitPage() {
  const { requestId } = useParams<{ requestId: string }>();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Monthly Finance Submission</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit your cash request for next month and expense justification for last month
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <UploadPanel
            type="cash_request"
            title="Cash Request"
            subtitle="What your office needs for next month"
            instructions={[
              "Budget line items with amounts (XAF)",
              "Purpose / description per line",
              "Opening wallet balance",
            ]}
            accentColor={{ bg: "bg-blue-600", btn: "bg-blue-600 hover:bg-blue-700", icon: "border-blue-200 bg-blue-50" }}
            endpoint={`/api/cash-requests/${requestId}/submit`}
          />
          <UploadPanel
            type="justification"
            title="Expense Justification"
            subtitle="How last month's cash was spent"
            instructions={[
              "Expense line items with actual amounts",
              "Description / purpose per expense",
              "Receipts or references where available",
              "Any unspent balance notes",
            ]}
            accentColor={{ bg: "bg-green-600", btn: "bg-green-600 hover:bg-green-700", icon: "border-green-200 bg-green-50" }}
            endpoint={`/api/cash-requests/${requestId}/submit-justification`}
          />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          You can submit each document separately. Both can be submitted at any time before the deadline.
          Submissions are reviewed by Intel HRC Finance — Tina-Randa.
        </p>
      </div>
    </div>
  );
}
