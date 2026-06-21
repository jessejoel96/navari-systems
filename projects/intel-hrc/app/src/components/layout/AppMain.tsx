"use client";

import { usePathname } from "next/navigation";
import { getPageGuide } from "@/lib/page-guides";
import { PageHelpGuide } from "@/components/layout/PageHelpGuide";

export function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const guide = getPageGuide(pathname);

  return (
    <>
      <div className="pb-24">{children}</div>
      {guide ? <PageHelpGuide guide={guide} /> : null}
    </>
  );
}
