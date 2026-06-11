import type { AuditAnalysis, AuditAnswers, DynamicQuestion } from "./types";

const INDUSTRY_LEAKS: Record<string, { process: string; hours: number; rate: number; solution: string }[]> = {
  "Real Estate": [
    { process: "Listing syndication across platforms", hours: 10, rate: 840, solution: "Automate listing sync from one master source to all portals" },
    { process: "Lead follow-up routing", hours: 6, rate: 490, solution: "Trigger-based CRM sequences on new lead entry" },
    { process: "Document preparation and chasing", hours: 4, rate: 320, solution: "Auto-generate docs on deal stage change" },
  ],
  "Online Education": [
    { process: "Student onboarding emails and setup", hours: 12, rate: 980, solution: "Automated welcome and access sequence on payment confirmation" },
    { process: "Progress tracking and certificate delivery", hours: 5, rate: 410, solution: "Milestone-triggered certificate generation and delivery" },
    { process: "Enrolment data sync between platforms", hours: 4, rate: 330, solution: "Bidirectional sync between course platform and CRM" },
  ],
  "Professional Services": [
    { process: "Client intake qualification and routing", hours: 8, rate: 700, solution: "Automated intake form with scoring and calendar routing" },
    { process: "Document collection and chasing", hours: 6, rate: 520, solution: "Smart reminders with tracked document portals" },
    { process: "Invoice generation and follow-up", hours: 4, rate: 350, solution: "Trigger-based invoice creation and payment reminders" },
  ],
  "E-commerce": [
    { process: "Order processing and fulfilment updates", hours: 10, rate: 800, solution: "Automated order routing and customer status updates" },
    { process: "Inventory sync and restock alerts", hours: 5, rate: 410, solution: "Real-time inventory sync with threshold-based purchasing alerts" },
    { process: "Returns and refund processing", hours: 6, rate: 490, solution: "Automated returns workflow from request to resolution" },
  ],
  "Marketing Agency": [
    { process: "Client performance reporting", hours: 12, rate: 980, solution: "Auto-generated reports from connected ad and analytics APIs" },
    { process: "Campaign tracking and status updates", hours: 6, rate: 490, solution: "Dashboard-based status sync with automated client emails" },
    { process: "Invoice and retainer billing", hours: 3, rate: 245, solution: "Scheduled invoice generation linked to project milestones" },
  ],
  "Healthcare / Wellness": [
    { process: "Appointment booking and reminders", hours: 8, rate: 560, solution: "Automated scheduling with SMS/email reminders and waitlist management" },
    { process: "Patient intake and form collection", hours: 6, rate: 420, solution: "Digital intake forms that sync to records on submission" },
    { process: "Follow-up and recall sequences", hours: 4, rate: 280, solution: "Trigger-based follow-up campaigns after appointments" },
  ],
  "Construction / Trades": [
    { process: "Job quoting and estimate follow-up", hours: 10, rate: 700, solution: "Template-based quoting with automated follow-up on pending estimates" },
    { process: "Site scheduling and crew dispatch", hours: 7, rate: 490, solution: "Calendar-based dispatch with automated crew notifications" },
    { process: "Invoice and payment chasing", hours: 5, rate: 350, solution: "Milestone-triggered invoicing with payment reminders" },
  ],
  "SaaS / Tech": [
    { process: "Customer onboarding and provisioning", hours: 9, rate: 630, solution: "Automated account setup and welcome sequences on signup" },
    { process: "Support ticket triage and routing", hours: 6, rate: 420, solution: "AI-assisted ticket classification and routing rules" },
    { process: "Usage reporting and billing sync", hours: 4, rate: 280, solution: "Automated usage metering synced to billing platform" },
  ],
};

const DYNAMIC_FALLBACKS: Record<string, DynamicQuestion[]> = {
  default: [
    {
      question: "How does your team currently handle new client onboarding?",
      options: [
        "Manual emails and calls for each new client",
        "Partly automated but someone still follows up",
        "Mostly automated with light oversight",
        "Fully automated, no manual steps",
      ],
    },
    {
      question: "When does most of your team's manual work happen?",
      options: [
        "Getting new clients set up",
        "Running active projects or orders",
        "Reporting and updating records",
        "Billing and chasing payments",
      ],
    },
  ],
};

export function getFallbackDynamicQuestions(industry: string): DynamicQuestion[] {
  return DYNAMIC_FALLBACKS[industry] ?? DYNAMIC_FALLBACKS.default;
}

const FALLBACK_CHALLENGES: Record<string, string[]> = {
  "Real Estate": [
    "Same listing data entered into multiple portals manually",
    "Lead follow-up emails not sent after form submissions",
    "Missing documents delay deal progression and require chasing",
    "Manual reconciliation between CRM and spreadsheet records",
    "Showing schedules coordinated by email and text chains",
    "Commission calculations done manually each month",
    "Tenant or buyer enquiries not routed to the right agent",
    "Status updates to clients sent inconsistently or late",
  ],
  "Online Education": [
    "Student access not provisioned automatically after payment",
    "Welcome emails missed when enrolment forms are completed",
    "Progress tracking updated manually across platforms",
    "Certificate delivery depends on someone checking spreadsheets",
    "Duplicate student data entered in course platform and CRM",
    "Refund and cancellation handling done by hand",
    "Cohort assignments coordinated manually each intake",
    "Support tickets not linked to student enrolment records",
  ],
  default: [
    "Same client data entered into multiple systems manually",
    "Reconciliation between tools done in spreadsheets weekly",
    "Missing documents cause delays and repeated follow-up",
    "Confirmation emails not sent after form submissions",
    "Team not notified when a client completes an action",
    "Manual handoffs between sales and operations drop tasks",
    "Reporting compiled by copying data between tools",
    "Billing and invoice follow-up done inconsistently",
  ],
};

export function getFallbackChallenges(answers: Partial<AuditAnswers>): string[] {
  const base = FALLBACK_CHALLENGES[answers.industry ?? ""] ?? FALLBACK_CHALLENGES.default;
  return base.slice(0, 8);
}

export function getFallbackReflection(answers: Partial<AuditAnswers>): string {
  const industry = answers.subIndustry
    ? `${answers.subIndustry} (${answers.industry ?? "your industry"})`
    : (answers.industry ?? "your industry");
  const depts = answers.departments?.join(" and ") ?? "operations";
  const goal = answers.primaryGoal ? ` Given your goal to ${answers.primaryGoal.toLowerCase()},` : "";
  const pain = answers.painPoint
    ? ` The bottleneck you described — "${answers.painPoint}" — is likely costing 12–18 hours per week alone.`
    : " At your team size, this typically adds up to 15–20 hours of recoverable time per week.";

  return `Based on your inputs, the primary cost in your ${industry} business appears to be in your ${depts} — specifically the manual steps your team runs each time work moves through your pipeline.${pain}${goal} that is the first place we would look.

A secondary pattern we see in ${answers.industry ?? "similar"} businesses is disconnected tools creating data gaps. When your systems do not talk to each other, someone bridges them by hand every day — and that is the source of most errors that reach clients.`;
}

export function getFallbackAnalysis(answers: Partial<AuditAnswers>): AuditAnalysis {
  const industry = answers.industry ?? "default";
  const leakData = INDUSTRY_LEAKS[industry] ?? INDUSTRY_LEAKS["Professional Services"];
  const revenueStr = answers.revenue ?? "$15k–$25k/month";
  const isHighValue =
    revenueStr.includes("$25k") ||
    revenueStr.includes("$50k") ||
    revenueStr.includes("$100k");

  const leaks = leakData.map((l, i) => ({
    rank: i + 1,
    process: l.process,
    weeklyHours: l.hours,
    weeklyRevenueCost: l.rate,
    annualCost: l.rate * 52,
    automationFeasibility: (["High", "High", "Medium"] as const)[i],
    solution: l.solution,
  }));

  const totalHours = leaks.reduce((s, l) => s + l.weeklyHours, 0);
  const totalRevenue = leaks.reduce((s, l) => s + l.weeklyRevenueCost, 0);

  const urgent = answers.urgency?.includes("actively costing");
  const goal = answers.primaryGoal ?? "improve operations";
  const capacityMap: Record<string, string> = {
    "Recover time": "Recover 15–20 hours per week for higher-value work",
    "Increase revenue capacity": "Handle 30–40% more clients with the same team",
    "Fix operational errors": "Cut client-facing errors by 60–80% within 60 days",
    "Reduce costs": `Save roughly $${(totalRevenue * 4).toLocaleString()} per month in recoverable labour cost`,
    "Improve client experience": "Reduce response delays and inconsistency across every client touchpoint",
    "Document and standardise": "Get core processes out of people's heads and into repeatable SOPs",
  };

  return {
    profile: isHighValue ? "high-value" : "ready-to-build",
    reflectionText: getFallbackReflection(answers),
    leaks,
    totals: {
      weeklyHours: totalHours,
      weeklyRevenue: totalRevenue,
      annualSavings: totalRevenue * 52,
      capacityUpside: capacityMap[goal] ?? "Handle 30–40% more volume with the same team",
    },
    recommendation: urgent && answers.painPoint ? "build" : "audit",
    recommendationReason: urgent
      ? `Your stated urgency and specific pain point suggest the problem is scoped enough to move fast. A full Navari Audit will still map exact costs before build, but you are closer to deployment than most.`
      : "The Three Leaks Report will map exact process costs and build sequence before any budget is committed. Most clients see ROI within 30 days of deployment.",
    urgencyNote: urgent
      ? `At your revenue level, waiting another month costs roughly $${(totalRevenue * 4).toLocaleString()} in recoverable capacity — and you flagged this as urgent.`
      : `At your revenue level, this delay costs roughly $${(totalRevenue * 4).toLocaleString()} per month in recoverable capacity.`,
  };
}
