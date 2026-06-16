"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { NAV_LINKS } from "@/lib/constants";
import { useActiveSection } from "./useActiveSection";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeSection = useActiveSection();

  function isActive(href: string) {
    if (href.startsWith("/#")) {
      return pathname === "/" && activeSection === href.slice(2);
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[7.5rem] items-center justify-between border-b border-gold/15 bg-navy/97 px-5 backdrop-blur-md md:px-10">
      <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
        <BrandLogo variant="transparent" priority />
      </Link>

      <ul className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-[15px] font-medium tracking-wide transition-colors hover:text-white ${
                isActive(link.href) ? "text-white" : "text-silver-dark-bg"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/audit"
            className="rounded bg-gold px-5 py-2.5 text-sm font-semibold tracking-wide text-navy transition-colors hover:bg-gold-light"
          >
            Free Audit
          </Link>
        </li>
      </ul>

      <button
        type="button"
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`h-0.5 w-6 bg-white transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`h-0.5 w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-6 bg-white transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-[7.5rem] border-b border-gold/15 bg-navy px-5 py-6 md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-base font-medium text-silver-dark-bg hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/audit"
                className="inline-block rounded bg-gold px-5 py-2 text-sm font-semibold text-navy"
                onClick={() => setOpen(false)}
              >
                Free Audit
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
