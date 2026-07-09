"use client";

import dynamic from "next/dynamic";

const DiscoveryWizard = dynamic(() => import("@/components/discovery/DiscoveryWizard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-mono text-white/40">Loading…</p>
      </div>
    </div>
  ),
});

export default function DiscoveryWizardLoader() {
  return <DiscoveryWizard />;
}
