import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tell us about your business",
  description:
    "A few questions so Navari knows how we can help. Takes about 5 minutes — then book a call if you like.",
  openGraph: {
    title: "Tell Navari about your business",
    description:
      "Share where you are today and what you need. We'll send a short summary and suggested next steps.",
  },
};

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh font-body">{children}</div>;
}
