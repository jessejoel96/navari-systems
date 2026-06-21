"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Suspense } from "react";

type State = "loading" | "approving" | "success" | "error";

function ApprovalContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const cycleId = params.get("cycle");
  const action = params.get("action");

  const [state, setState] = useState<State>("loading");
  const [cycleLabel, setCycleLabel] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      if (!cycleId) { setState("error"); setMessage("Missing cycle ID"); return; }
      try {
        const res = await fetch(`/api/cash-requests/cycles`);
        const cycles = await res.json() as Array<{ id: string; label: string }>;
        const c = cycles.find((c) => c.id === cycleId);
        setCycleLabel(c?.label ?? "Unknown Period");
        setState("loading");
      } catch {
        setState("error");
        setMessage("Could not load cycle details");
      }
    }
    load();
  }, [cycleId]);

  async function handleApprove() {
    if (!cycleId) return;
    setState("approving");
    try {
      const res = await fetch(`/api/cash-requests/cycles/${cycleId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setState("success");
      setMessage(action === "approve" ? "Cash requests approved successfully." : "Cash requests rejected.");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Unexpected error");
    }
  }

  if (state === "success") {
    const approved = action === "approve";
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${approved ? "bg-green-100" : "bg-red-100"}`}>
            {approved ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {approved ? "Requests Approved" : "Requests Rejected"}
          </h2>
          <p className="text-slate-500 text-sm mb-2">{cycleLabel}</p>
          <p className="text-slate-500 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 text-sm">{message || "Invalid or expired link."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {action === "approve" ? "Approve" : "Reject"} Cash Requests
        </h2>
        {cycleLabel && <p className="text-slate-500 text-sm mb-6">{cycleLabel}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={state === "approving"}
            className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-colors ${
              action === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {state === "approving" ? "Processing…" : action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApproveCashRequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    }>
      <ApprovalContent />
    </Suspense>
  );
}
