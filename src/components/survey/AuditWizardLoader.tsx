"use client";

import dynamic from "next/dynamic";

const AuditWizard = dynamic(() => import("./AuditWizard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-footer-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-slate/40">Loading audit tool…</p>
      </div>
    </div>
  ),
});

export default function AuditWizardLoader() {
  return <AuditWizard />;
}
