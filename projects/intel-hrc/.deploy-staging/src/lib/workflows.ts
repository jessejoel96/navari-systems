import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Wallet,
  CalendarClock,
  CreditCard,
  ArrowLeftRight,
} from "lucide-react";

export type WorkflowGuide = {
  id: string;
  groupId: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  problem: string;
  solution: string;
  hoursSaved: number;
  moneySaved: string;
  steps: string[];
  subPages: string[];
  tags: string[];
};

export const WORKFLOW_GUIDES: WorkflowGuide[] = [
  {
    id: "invoicing",
    groupId: "invoicing",
    title: "Invoice Intake & Processing",
    subtitle: "From receipt to Sage export",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    problem:
      "Manual entry from scanned invoices takes 15–25 minutes each. Three-way matching is still on paper.",
    solution:
      "OCR extracts data instantly, matches POs, routes to CFO, and generates Sage .txt exports.",
    hoursSaved: 40,
    moneySaved: "320,000 XAF",
    steps: [
      "Upload or email invoice (PDF/scan)",
      "AI extracts supplier, amounts, GL codes",
      "Auto-match to PO + delivery note",
      "Route to CFO for approval",
      "Generate Sage .txt export",
      "Schedule for weekly payment run",
    ],
    subPages: ["Invoice Inbox", "Approvals", "Sage Exports", "Suppliers"],
    tags: ["OCR", "Auto-match", "CFO Approval"],
  },
  {
    id: "cash-requests",
    groupId: "cash-requests",
    title: "Cash Requests & Justifications",
    subtitle: "6 offices, one monthly cycle",
    icon: Wallet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    problem:
      "Chasing 6 regional offices by email. Manual Excel compilation and lost justifications.",
    solution:
      "Auto-send on the 24th, self-service submissions, one-click compile and CFO routing.",
    hoursSaved: 32,
    moneySaved: "256,000 XAF",
    steps: [
      "Create monthly cycle",
      "Auto-email 6 entities on the 24th",
      "Entities submit via portal",
      "Review, confirm or query",
      "Compile into Excel summary",
      "Send to CFO for approval",
    ],
    subPages: ["Monthly Cycles"],
    tags: ["Auto-email", "Self-service", "Compilation"],
  },
  {
    id: "prepaid",
    groupId: "prepaid",
    title: "Prepaid Expense Amortization",
    subtitle: "SYSCOHADA 476 accounts",
    icon: CalendarClock,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    problem:
      "Prepaid contracts tracked in Excel with manual monthly journals and missed deadlines.",
    solution:
      "Register once; system builds amortization schedules and Sage journal entries.",
    hoursSaved: 16,
    moneySaved: "128,000 XAF",
    steps: [
      "Register prepaid contract",
      "Auto-calculate monthly schedule",
      "Monthly posting reminder",
      "Generate Sage 476 → expense transfer",
      "Track remaining balance",
      "Export monthly summary for CFO",
    ],
    subPages: ["Contracts & Schedule"],
    tags: ["SYSCOHADA", "Auto-schedule", "476 Accounts"],
  },
  {
    id: "payments",
    groupId: "payments",
    title: "Payment Scheduling",
    subtitle: "Wednesday cut-off, Friday run",
    icon: CreditCard,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    problem:
      "Building payment sheets by hand from approved invoices, with duplicate-payment risk.",
    solution:
      "Auto-generates bank and Maviance sheets with deduplication and digital sign-off.",
    hoursSaved: 24,
    moneySaved: "192,000 XAF",
    steps: [
      "Collect approved invoices by Wed 12:00",
      "Generate bank payment sheet",
      "Generate Maviance mobile money sheet",
      "CFO digital signature",
      "Mark invoices paid + reconcile",
    ],
    subPages: ["Payment Runs", "Maviance"],
    tags: ["Auto-generate", "Deduplication", "Audit Trail"],
  },
  {
    id: "intercompany",
    groupId: "intercompany",
    title: "Intercompany Reconciliation",
    subtitle: "7 entities, automatic splits",
    icon: ArrowLeftRight,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    problem:
      "Manual intercompany journals across 7 Sage files; reconciliation gaps take days.",
    solution:
      "INC code tracking with paired debit/credit entries exported for all entities at once.",
    hoursSaved: 20,
    moneySaved: "160,000 XAF",
    steps: [
      "Tag invoice with split ratios",
      "Apply INC codes per entity",
      "Generate paired journal entries",
      "Export Sage .txt for all 7 entities",
      "Monthly reconciliation report",
    ],
    subPages: ["Reconciliation"],
    tags: ["INC Codes", "Auto-split", "Multi-entity"],
  },
];

/** Other finance roles Navari can extend to (from accounting-department.md) */
export const DEPARTMENT_ROLE_EXTENSIONS = [
  {
    role: "Treasury & payments",
    benefit: "Automated disbursement schedules, dual-auth payment batches, and archive registers.",
  },
  {
    role: "Tax & payroll oversight",
    benefit: "WHT schedules, VAT reconciliation trails, and payroll journal handoff from Sage Paie.",
  },
  {
    role: "FP&A & month-end close",
    benefit: "Budget validation checkpoints, exception registers, and close coordination dashboards.",
  },
  {
    role: "Intercompany & group reporting",
    benefit: "Paired journal entries across entities with INC tracking and reconciliation reports.",
  },
] as const;

export const WORKFLOW_GROUP_LABELS: Record<string, string> = {
  invoicing: "Invoicing",
  "cash-requests": "Cash Requests",
  prepaid: "Prepaid Payments",
  payments: "Payments",
  intercompany: "Intercompany",
};

export const TINA_MONTHLY_HOURS_SAVED = WORKFLOW_GUIDES.reduce(
  (sum, w) => sum + w.hoursSaved,
  0
);

export const TINA_MONTHLY_SAVINGS = "1,056,000 XAF";
