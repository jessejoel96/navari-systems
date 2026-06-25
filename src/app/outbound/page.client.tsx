"use client";

import { useCallback, useEffect, useState } from "react";
import type { OutboundDashboardData } from "@/lib/outbound/dashboard-data";

function Meter({
  label,
  used,
  limit,
  status,
}: {
  label: string;
  used: number;
  limit: number;
  status: "ok" | "warn" | "critical";
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const bar =
    status === "critical" ? "bg-red-500" : status === "warn" ? "bg-amber-500" : "bg-[var(--gold)]";

  return (
    <div className="rounded-lg border border-[var(--gold-border)] bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-white/90">{label}</span>
        <span className="font-mono text-xs text-white/60">
          {used}/{limit} today
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full transition-all ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-xl border border-[var(--gold-border)] bg-[#0d1a2d] p-5">
      <p className="text-xs uppercase tracking-wider text-[var(--gold)]">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-sm text-white/50">{hint}</p> : null}
    </div>
  );
}

export default function OutboundDashboardClient() {
  const [data, setData] = useState<OutboundDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    const url = key ? `/api/outbound/status?key=${encodeURIComponent(key)}` : "/api/outbound/status";
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 401 ? "Add ?key=LEAD_FETCH_SECRET to the URL" : "Failed to load");
        setData(null);
        return;
      }
      setData(await res.json());
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="min-h-screen bg-[var(--navy)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">Navari Outbound</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-white" style={{ textWrap: "balance" }}>
              Daily pipeline overview
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Credit meters, queue health, and observation gate. CLI:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">npm run lead:status</code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-[var(--gold-border)] px-4 py-2 text-sm text-[var(--gold-light)] transition hover:bg-white/5"
          >
            Refresh
          </button>
        </header>

        {loading && !data ? <p className="text-white/60">Loading…</p> : null}
        {error ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</p> : null}

        {data ? (
          <div className="space-y-10">
            {data.pipeline ? (
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Hot leads" value={data.pipeline.hot} />
                <StatCard label="Ready to send" value={data.pipeline.readyForOutreach} hint="Has observation" />
                <StatCard
                  label="Needs research"
                  value={data.pipeline.missingObservationHot}
                  hint="Observation missing"
                />
                <StatCard label="Contacted today" value={data.pipeline.contactedToday} />
              </section>
            ) : null}

            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-white">API budget (today)</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.budget
                  .filter((b) => b.dailyLimit > 0)
                  .map((b) => (
                    <Meter
                      key={b.metric}
                      label={b.label}
                      used={b.dailyUsed}
                      limit={b.dailyLimit}
                      status={b.status}
                    />
                  ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-white">Hot queue</h2>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/50">
                    <tr>
                      <th className="px-4 py-3">Lead</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Observation</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hotLeads.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                          No hot leads yet — run fetch when budget allows
                        </td>
                      </tr>
                    ) : (
                      data.hotLeads.map((lead) => (
                        <tr key={lead.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{lead.full_name ?? "—"}</div>
                            <div className="text-xs text-white/50">{lead.title}</div>
                          </td>
                          <td className="px-4 py-3 text-white/80">{lead.company_name ?? "—"}</td>
                          <td className="px-4 py-3 font-mono text-[var(--gold-light)]">{lead.icp_score}</td>
                          <td className="px-4 py-3">
                            {lead.hasObservation ? (
                              <span className="text-emerald-400">Ready</span>
                            ) : (
                              <span className="text-amber-400">Research</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white/60">{lead.outreach_status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="text-xs text-white/40">
              Updated {new Date(data.generatedAt).toLocaleString()} · Free-plan aware · Layer One outreach
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
