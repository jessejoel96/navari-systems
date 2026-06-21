import type { Metadata } from "next";
import { DM_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intel HRC — AP Workflow",
  description: "Accounts Payable automation for Intel HRC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${sourceSans.variable} ${dmSans.variable} bg-brand-bg font-[family-name:var(--font-body)] text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
