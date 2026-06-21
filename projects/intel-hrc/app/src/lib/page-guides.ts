export type PageGuideSlide = {
  title: string;
  body: string;
};

export type PageGuide = {
  id: string;
  slides: PageGuideSlide[];
};

export const PAGE_GUIDES: Record<string, PageGuide> = {
  "/dashboard": {
    id: "dashboard",
    slides: [
      {
        title: "Your daily starting point",
        body: "The dashboard shows what you finished this week, what still needs action, reminders, and bottlenecks across all entities.",
      },
      {
        title: "Prioritise by urgency",
        body: "Check bottlenecks and overdue items first, then work through to-do and coming-up deadlines.",
      },
      {
        title: "Jump straight in",
        body: "Use the quick links to upload an invoice or open a workflow from the sidebar when you are ready to process.",
      },
    ],
  },
  "/invoices": {
    id: "invoices",
    slides: [
      {
        title: "Invoice inbox",
        body: "All incoming supplier invoices land here. Filter by entity or status to find what needs review or approval.",
      },
      {
        title: "Upload new invoices",
        body: "Use Upload Invoice to add PDFs or images. The platform extracts key fields so you spend less time on manual entry.",
      },
      {
        title: "Track every stage",
        body: "Status badges show where each invoice is — received, pending approval, ready for Sage export, or scheduled for payment.",
      },
    ],
  },
  "/invoices/new": {
    id: "invoices-new",
    slides: [
      {
        title: "Capture the document",
        body: "Upload the supplier invoice file first. Supported formats include PDF and common image types.",
      },
      {
        title: "Confirm extracted data",
        body: "Review supplier, amount, entity, and line details before saving. Correct anything the extraction missed.",
      },
      {
        title: "Send for approval",
        body: "Once saved, the invoice follows your approval workflow and appears in the inbox with its new status.",
      },
    ],
  },
  "/approvals": {
    id: "approvals",
    slides: [
      {
        title: "Approval board",
        body: "Invoices waiting for sign-off appear here. Review amounts, entities, and supporting detail before approving.",
      },
      {
        title: "Approve or send back",
        body: "Approved invoices move to Sage export. Rejected or queried items return to the AP team for correction.",
      },
    ],
  },
  "/sage-exports": {
    id: "sage-exports",
    slides: [
      {
        title: "Sage-ready batches",
        body: "Approved invoices grouped for Sage import are listed here with export status and file references.",
      },
      {
        title: "Export with confidence",
        body: "Generate or download export files when a batch is complete. Keep audit trails for finance controls.",
      },
    ],
  },
  "/suppliers": {
    id: "suppliers",
    slides: [
      {
        title: "Supplier master data",
        body: "Maintain supplier names, codes, and entity links used across invoicing and payment runs.",
      },
      {
        title: "Keep records accurate",
        body: "Correct supplier details here to avoid mismatches during invoice matching and Sage posting.",
      },
    ],
  },
  "/cash-requests": {
    id: "cash-requests",
    slides: [
      {
        title: "Monthly cash cycles",
        body: "Each cycle covers entity cash requests for the period. Track submission, compilation, and CFO approval stages.",
      },
      {
        title: "Entity submissions",
        body: "Expand a cycle to see per-entity requests, line items, and justification status.",
      },
      {
        title: "Compile and send",
        body: "When submissions are in, compile the pack and progress toward CFO approval and payment scheduling.",
      },
    ],
  },
  "/prepaid": {
    id: "prepaid",
    slides: [
      {
        title: "Prepaid contracts",
        body: "Manage prepaid expense contracts and amortisation schedules across entities.",
      },
      {
        title: "Two-step workflow",
        body: "Step 1 captures the contract; Step 2 schedules monthly recognition entries for Sage.",
      },
    ],
  },
  "/payments": {
    id: "payments",
    slides: [
      {
        title: "Payment runs",
        body: "Group approved payables into batches for bank processing. Review totals and entity splits before releasing.",
      },
      {
        title: "Documents and audit",
        body: "Attach or review supporting documents linked to each payment batch for compliance.",
      },
    ],
  },
  "/maviance": {
    id: "maviance",
    slides: [
      {
        title: "Mobile money payments",
        body: "Track Maviance mobile-money disbursements alongside standard bank payment runs.",
      },
      {
        title: "Reconcile promptly",
        body: "Match Maviance confirmations back to invoice and batch records to close the loop.",
      },
    ],
  },
  "/intercompany": {
    id: "intercompany",
    slides: [
      {
        title: "Intercompany reconciliation",
        body: "Review cross-entity balances and matching entries to keep IC accounts aligned.",
      },
      {
        title: "Resolve differences",
        body: "Use entity filters and status indicators to focus on unmatched or disputed IC lines.",
      },
    ],
  },
  "/documents": {
    id: "documents",
    slides: [
      {
        title: "Document library",
        body: "Central store for policies, templates, and supporting files referenced across AP workflows.",
      },
      {
        title: "Find what you need",
        body: "Search and filter by category to locate export templates, approval packs, or entity-specific guides.",
      },
    ],
  },
  "/reports": {
    id: "reports",
    slides: [
      {
        title: "Finance reporting",
        body: "Access operational reports on invoice volumes, approval times, and payment activity.",
      },
      {
        title: "Share with stakeholders",
        body: "Export or review summaries for management and audit — data reflects live workflow status.",
      },
    ],
  },
  "/assistant": {
    id: "assistant",
    slides: [
      {
        title: "AI assistant",
        body: "Ask questions about AP processes, invoice status, or how to complete a task in this platform.",
      },
      {
        title: "Guidance, not authority",
        body: "Use assistant answers as a guide. Always confirm amounts and approvals in the official workflow screens.",
      },
    ],
  },
  "/settings": {
    id: "settings",
    slides: [
      {
        title: "Platform settings",
        body: "Configure entities, users, approval rules, and integration options for the Intel HRC AP environment.",
      },
      {
        title: "Admin changes only",
        body: "Some settings affect all users. Coordinate with finance ops before changing approval or export rules.",
      },
    ],
  },
  "/approve-cash-requests": {
    id: "approve-cash-requests",
    slides: [
      {
        title: "CFO cash approval",
        body: "Review compiled monthly cash request packs before final sign-off and release.",
      },
      {
        title: "Check entity totals",
        body: "Confirm line items, justifications, and entity totals match the submitted compilation.",
      },
    ],
  },
  "/approve-payment": {
    id: "approve-payment",
    slides: [
      {
        title: "Payment approval",
        body: "Authorise payment batches after AP preparation. Verify beneficiary and amount details.",
      },
      {
        title: "Final control point",
        body: "Once approved, batches proceed to bank or Maviance execution — this step cannot be undone lightly.",
      },
    ],
  },
};

const GUIDE_MATCHERS: { prefix: string; guide: PageGuide }[] = [
  { prefix: "/invoices/new", guide: PAGE_GUIDES["/invoices/new"] },
  { prefix: "/cash-requests/submit", guide: PAGE_GUIDES["/cash-requests"] },
  { prefix: "/invoices/", guide: PAGE_GUIDES["/invoices"] },
];

export function getPageGuide(pathname: string): PageGuide | null {
  if (PAGE_GUIDES[pathname]) return PAGE_GUIDES[pathname];

  for (const { prefix, guide } of GUIDE_MATCHERS) {
    if (pathname.startsWith(prefix)) return guide;
  }

  return null;
}
