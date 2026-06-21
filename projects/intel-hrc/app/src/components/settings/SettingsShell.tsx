"use client";

import { useState } from "react";
import { Pencil, Check, X, Save, AlertCircle, CheckCircle2, Mail, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ──────────────────────────────────────────────── */

type Entity = {
  id: string;
  name: string;
  code: string;
  country: string;
  is_hq: boolean;
  contact_email: string | null;
  contact_name: string | null;
  sage_folder: string | null;
  purchase_journal: string | null;
  cash_journal: string | null;
  general_journal: string | null;
  account_digits: number | null;
};

type Setting = {
  key: string;
  value: string | null;
  label: string;
  description: string | null;
  group_name: string;
};

/* ── Small save-state badge ─────────────────────────────── */

function SaveBadge({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${
          state === "saving" ? "bg-blue-50 text-blue-600"
          : state === "saved" ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-600"
        }`}
      >
        {state === "saving" && <span className="animate-spin">↻</span>}
        {state === "saved" && <CheckCircle2 className="w-3 h-3" />}
        {state === "error" && <AlertCircle className="w-3 h-3" />}
        {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Error"}
      </motion.span>
    </AnimatePresence>
  );
}

/* ── Inline editable cell ───────────────────────────────── */

function EditableCell({
  value,
  placeholder,
  type = "text",
  onSave,
}: {
  value: string | null;
  placeholder: string;
  type?: "text" | "email";
  onSave: (newValue: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function commit() {
    if (draft === (value ?? "")) { setEditing(false); return; }
    setSaveState("saving");
    try {
      await onSave(draft);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
    setEditing(false);
  }

  function cancel() {
    setDraft(value ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
          placeholder={placeholder}
          className="border border-blue-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0 w-52"
        />
        <button onClick={commit} className="p-1 rounded text-green-600 hover:bg-green-50 transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={cancel} className="p-1 rounded text-slate-400 hover:bg-slate-100 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value ?? ""); setEditing(true); }}
      className="group flex items-center gap-1.5 text-sm text-left"
    >
      {value ? (
        <span className="text-slate-700">{value}</span>
      ) : (
        <span className="text-slate-300 italic">{placeholder}</span>
      )}
      <Pencil className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
      <SaveBadge state={saveState} />
    </button>
  );
}

/* ── System settings row ────────────────────────────────── */

function SettingRow({ setting, onSave }: { setting: Setting; onSave: (key: string, value: string) => Promise<void> }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-slate-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-700">{setting.label}</div>
        {setting.description && (
          <div className="text-xs text-slate-400 mt-0.5">{setting.description}</div>
        )}
      </div>
      <div className="shrink-0 w-64">
        <EditableCell
          value={setting.value}
          placeholder="Click to set…"
          type={setting.key.includes("email") ? "email" : "text"}
          onSave={(v) => onSave(setting.key, v)}
        />
      </div>
    </div>
  );
}

/* ── Main shell ─────────────────────────────────────────── */

export default function SettingsShell({
  entities,
  settings,
}: {
  entities: Entity[];
  settings: Setting[];
}) {
  const [localEntities, setLocalEntities] = useState<Entity[]>(entities);
  const [localSettings, setLocalSettings] = useState<Setting[]>(settings);

  async function saveEntityField(
    entityId: string,
    field: "contact_email" | "contact_name",
    value: string
  ) {
    const res = await fetch(`/api/entities/${entityId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Failed to save");
    }
    setLocalEntities((prev) =>
      prev.map((e) => (e.id === entityId ? { ...e, [field]: value } : e))
    );
  }

  async function saveSetting(key: string, value: string) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Failed to save");
    }
    setLocalSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  }

  const emailSettings = localSettings.filter((s) => s.group_name === "emails");
  const crSettings = localSettings.filter((s) => s.group_name === "cash_requests");

  const regionalEntities = localEntities.filter((e) => !e.is_hq);
  const hqEntity = localEntities.find((e) => e.is_hq);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage email contacts, system addresses, and entity configuration.
        </p>
      </div>

      {/* ── Section: Email Addresses ── */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">System Email Addresses</h2>
            <p className="text-xs text-slate-400">Used for approvals, notifications, and cash request emails</p>
          </div>
        </div>
        <div className="px-6">
          {emailSettings.map((s) => (
            <SettingRow key={s.key} setting={s} onSave={saveSetting} />
          ))}
        </div>
      </section>

      {/* ── Section: Cash Request Settings ── */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Save className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Cash Request Schedule</h2>
            <p className="text-xs text-slate-400">Which day of the month emails go out and when responses are due</p>
          </div>
        </div>
        <div className="px-6">
          {crSettings.map((s) => (
            <SettingRow key={s.key} setting={s} onSave={saveSetting} />
          ))}
        </div>
      </section>

      {/* ── Section: Entity Contacts ── */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Entity Cash Request Contacts</h2>
            <p className="text-xs text-slate-400">
              Who receives the monthly cash request email for each regional office — click any cell to edit
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Country</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Contact Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {regionalEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-semibold text-slate-800">{entity.name}</span>
                    <span className="ml-2 text-xs text-slate-400">{entity.code}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{entity.country}</td>
                  <td className="px-6 py-3.5">
                    <EditableCell
                      value={entity.contact_name}
                      placeholder="Add contact name…"
                      onSave={(v) => saveEntityField(entity.id, "contact_name", v)}
                    />
                  </td>
                  <td className="px-6 py-3.5">
                    <EditableCell
                      value={entity.contact_email}
                      placeholder="Add email address…"
                      type="email"
                      onSave={(v) => saveEntityField(entity.id, "contact_email", v)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hqEntity && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-400">
              <span className="font-medium text-slate-500">HQ ({hqEntity.name})</span> — does not send or receive cash requests.
            </p>
          </div>
        )}
      </section>

      {/* ── Section: Sage Entity Config (read-only) ── */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Sage Entity Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">Read-only — update via Supabase if Sage folders change</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Sage Folder</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Purchase</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Cash</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">General</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Digits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {localEntities.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-slate-800">{e.name}</span>
                    {e.is_hq && (
                      <span className="ml-2 bg-blue-100 text-blue-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                        HQ
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{e.code}</td>
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-400">{e.sage_folder ?? "—"}</td>
                  <td className="px-6 py-3.5">
                    {e.purchase_journal ? (
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded">
                        {e.purchase_journal}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-400 text-sm">{e.cash_journal ?? "—"}</td>
                  <td className="px-6 py-3.5 text-slate-400 text-sm">{e.general_journal ?? "—"}</td>
                  <td className="px-6 py-3.5 text-slate-400 text-sm">{e.account_digits ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section: App Info ── */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Application</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Version", value: "0.1.0 (Phase 0 Demo)" },
            { label: "Database", value: "Supabase (eu-west-3)" },
            { label: "AI Model", value: "Qwen 3.5 Flash" },
            { label: "Email Provider", value: "Resend" },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-slate-400">{label}</dt>
              <dd className="mt-1 font-medium text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
