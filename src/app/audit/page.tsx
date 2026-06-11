import type { Metadata } from "next";
import AuditWizardLoader from "@/components/survey/AuditWizardLoader";

export const metadata: Metadata = {
  title: "Free Operations Audit — Navari Systems",
  description:
    "In about 4 minutes, map where your business is losing the most time and money. Free preliminary assessment with cost estimates and automation recommendations.",
  openGraph: {
    title: "Free Operations Audit — Navari Systems",
    description:
      "In about 4 minutes, find out exactly where your business is bleeding time and money — and what an automated fix looks like.",
  },
};

export default function AuditPage() {
  return <AuditWizardLoader />;
}
