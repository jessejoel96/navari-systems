import type { LucideIcon } from "lucide-react";
import {
  FileText,
  CheckCircle2,
  Download,
  Users,
  Wallet,
  CalendarClock,
  CreditCard,
  Smartphone,
  ArrowLeftRight,
  BarChart3,
  Bot,
} from "lucide-react";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Sidebar workflow groups — parent workflows with sub-pages */
export const WORKFLOW_GROUPS: NavGroup[] = [
  {
    id: "invoicing",
    label: "Invoicing",
    items: [
      { name: "Invoice Inbox", href: "/invoices", icon: FileText },
      { name: "Approvals", href: "/approvals", icon: CheckCircle2 },
      { name: "Sage Exports", href: "/sage-exports", icon: Download },
      { name: "Suppliers", href: "/suppliers", icon: Users },
    ],
  },
  {
    id: "cash-requests",
    label: "Cash Requests",
    items: [
      { name: "Monthly Cycles", href: "/cash-requests", icon: Wallet },
    ],
  },
  {
    id: "prepaid",
    label: "Prepaid Payments",
    items: [
      { name: "Contracts & Schedule", href: "/prepaid", icon: CalendarClock },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    items: [
      { name: "Payment Runs", href: "/payments", icon: CreditCard },
      { name: "Maviance", href: "/maviance", icon: Smartphone },
    ],
  },
  {
    id: "intercompany",
    label: "Intercompany",
    items: [
      { name: "Reconciliation", href: "/intercompany", icon: ArrowLeftRight },
    ],
  },
];

export const UTILITY_NAV: NavItem[] = [
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "AI Assistant", href: "/assistant", icon: Bot },
];

export const DASHBOARD_HREF = "/dashboard";
export const WELCOME_HREF = "/welcome";
