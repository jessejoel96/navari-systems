"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  WORKFLOW_GROUPS,
  UTILITY_NAV,
  DASHBOARD_HREF,
  WELCOME_HREF,
} from "@/lib/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

function groupIsActive(pathname: string, hrefs: string[]) {
  return hrefs.some(
    (href) => pathname === href || (href !== "/" && pathname.startsWith(href))
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const defaultExpanded = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const group of WORKFLOW_GROUPS) {
      next[group.id] = groupIsActive(
        pathname,
        group.items.map((i) => i.href)
      );
    }
    return next;
  }, [pathname]);

  const isExpanded = (id: string) => expanded[id] ?? defaultExpanded[id] ?? false;

  const toggle = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? defaultExpanded[id] ?? false),
    }));
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-4">
        <BrandLogo href={WELCOME_HREF} imageClassName="h-9 w-auto max-w-[200px]" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <Link
          href={DASHBOARD_HREF}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === DASHBOARD_HREF
              ? "bg-brand-blue-light text-brand-blue"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <LayoutDashboard
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              pathname === DASHBOARD_HREF ? "text-brand-blue" : "text-gray-400"
            )}
          />
          Dashboard
        </Link>

        <Link
          href={WELCOME_HREF}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === WELCOME_HREF
              ? "bg-brand-blue-light text-brand-blue"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Sparkles
            className={cn(
              "h-[18px] w-[18px] shrink-0",
              pathname === WELCOME_HREF ? "text-brand-blue" : "text-gray-400"
            )}
          />
          Platform Overview
        </Link>

        <div className="my-3 border-t border-gray-100" />

        {WORKFLOW_GROUPS.map((group) => {
          const open = isExpanded(group.id);
          const active = groupIsActive(
            pathname,
            group.items.map((i) => i.href)
          );

          return (
            <div key={group.id} className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggle(group.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition-colors",
                  active ? "text-brand-blue" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    open ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {open && (
                <div className="ml-1 space-y-0.5 border-l border-gray-100 pl-2">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-blue-light text-brand-blue"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-brand-blue"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="my-3 border-t border-gray-100" />

        {UTILITY_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-blue-light text-brand-blue"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 px-4 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <div className="mt-2 px-3">
          <p className="text-[11px] font-medium text-gray-500">Tina-Randa</p>
          <p className="text-[10px] text-gray-400">AP Accountant</p>
        </div>
      </div>
    </aside>
  );
}
