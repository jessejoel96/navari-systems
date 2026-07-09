import type { Metadata } from "next";
import { Audiowide, Roboto } from "next/font/google";

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Consultation",
  description:
    "Tell Navari about your business. In 5–8 minutes, get a personalized summary, service recommendations, and investment estimate.",
  openGraph: {
    title: "Start Your AI Consultation",
    description:
      "AI-powered discovery — not a contact form. Get a tailored brief before you ever book a call.",
  },
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${audiowide.variable} ${roboto.variable} min-h-dvh [font-family:var(--font-roboto),system-ui,sans-serif]`}
    >
      {children}
    </div>
  );
}
