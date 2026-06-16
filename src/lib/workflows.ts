export type WorkflowProblem = {
  name: string;
  desc: string;
  cost: string;
};

export type IndustryWorkflow = {
  id: string;
  abbr: string;
  tabTitle: string;
  personaTag: string;
  header: string;
  subhead: string;
  problems: WorkflowProblem[];
  financialImpact: string;
  solution: {
    name: string;
    desc: string;
    outcomes: string[];
    architectureId: string;
  };
};

export type WorkflowArchitecture = {
  id: string;
  letter: string;
  title: string;
  industries: string[];
  trigger: string;
  aiAction: string;
  systemAction: string;
  outcome: string;
};

export const industryWorkflows: IndustryWorkflow[] = [
  {
    id: "law-firms",
    abbr: "LAW",
    tabTitle: "Law Firms",
    personaTag: "The Stretched Partner",
    header: "Partners doing intake work that isn't billable",
    subhead: "A practice management system that's really just a calendar",
    problems: [
      {
        name: "The Intake Drain",
        desc: "A new enquiry lands by email. A partner reads it, qualifies it, replies, schedules the call, then drafts the engagement letter from a Word template and chases the client for a signed return. None of this is billable. All of it happens before any actual legal work begins.",
        cost: "3–5 hrs/week per partner",
      },
      {
        name: "The Scattered Case File",
        desc: "Case documents live across email threads, a shared drive folder, and someone's desktop. Finding the latest version of anything means asking around first.",
        cost: "Files in 3 places at once",
      },
    ],
    financialImpact:
      "3–5 non-billable hours weekly, per partner · clients calling to ask for status updates that should have been automatic",
    solution: {
      name: "AI-Powered Intake & Engagement Engine",
      desc: "New enquiries are qualified automatically from your contact form, routed to the right partner, and booked straight into their calendar. Engagement letters draft themselves from the client's intake data, ready for a final read before signing.",
      outcomes: [
        "3–5 billable hours recovered per partner, weekly",
        "Zero manual engagement letter drafting",
        "Clients see status without calling to ask",
      ],
      architectureId: "legal-intake-engagement",
    },
  },
  {
    id: "mortgage-brokers",
    abbr: "MB",
    tabTitle: "Mortgage Brokers",
    personaTag: "The Volume Broker",
    header: "Leads going cold while they wait in a spreadsheet",
    subhead: "Speed of response is your conversion rate — and right now it's manual",
    problems: [
      {
        name: "The First-Contact Lag",
        desc: "Leads arrive from comparison sites, referrals, and your website. They land in a spreadsheet or basic CRM with no automated follow-up. Whoever checks it next decides how fast that lead gets a reply.",
        cost: "30+ min average response time",
      },
      {
        name: "The Document Black Hole",
        desc: "A checklist gets emailed manually. Nobody's tracking what's actually come back versus what's still outstanding until someone goes looking.",
        cost: "No visibility on what's missing",
      },
    ],
    financialImpact:
      "Conversion drops sharply once response time passes 30 minutes · cases stall for days waiting on documents nobody's chasing",
    solution: {
      name: "Instant Lead Response & Document Pipeline",
      desc: "Every lead is qualified and responded to within minutes of arriving, any time of day. Document checklists go out automatically and update in real time as items come back.",
      outcomes: [
        "Lead response time under 5 minutes",
        "Live view of every case's missing documents",
        "Zero leads sitting unanswered overnight",
      ],
      architectureId: "lead-to-docs",
    },
  },
  {
    id: "estate-agents",
    abbr: "EA",
    tabTitle: "Estate Agents",
    personaTag: "Estate Agents & Property Management",
    header: "You change a price on one site. The other three still show the old number.",
    subhead: "Listing updates done by hand. Leads depending on someone remembering to reply.",
    problems: [
      {
        name: "The copy-paste update trap",
        desc: "You update a price or photo on your main listing, then do the same on the agency site, the portal, social, and the window card. Separately, by hand. One wrong number and a buyer calls confused.",
        cost: "5-8 hrs/week duplicated",
      },
      {
        name: "The lead that got no reply",
        desc: "A buyer messages on WhatsApp at 7pm. Nobody sees it until 9am. They have already booked a viewing elsewhere. Not because the property was wrong. Because nobody was watching the inbox.",
        cost: "50% lower conversion after 30 min delay",
      },
    ],
    financialImpact:
      "6-8 hrs/week on duplication. 50% lower conversion when response slips past 30 minutes.",
    solution: {
      name: "Update once. Every platform updates. Every lead gets a reply.",
      desc: "Change the price in one place and every listing updates. Every inquiry, WhatsApp, email, or portal, gets a reply and goes to the right person. Even after hours.",
      outcomes: [
        "12 hrs/week recovered",
        "Listings stay consistent",
        "Replies in under 5 minutes",
      ],
      architectureId: "lead-crm",
    },
  },
  {
    id: "accounting",
    abbr: "ACC",
    tabTitle: "Accounting",
    personaTag: "The Compliance-First Practice Owner",
    header: "Client onboarding that's really just manual re-typing",
    subhead: "Software that does the job, surrounded by people doing the job manually anyway",
    problems: [
      {
        name: "The Re-Entry Risk",
        desc: "A new client fills out a PDF form. Someone on your team reads it and manually retypes the same information into your accounting software, then builds the folder structure, then sends the welcome sequence by hand.",
        cost: "Every new client, typed twice",
      },
      {
        name: "The Document Chase",
        desc: "Receipts and statements get requested by email. What's arrived and what's still missing lives in someone's memory, or a spreadsheet that's only as current as the last time someone updated it.",
        cost: "Hours lost every tax season",
      },
    ],
    financialImpact:
      "Manual re-entry introduces the exact errors your compliance obligations can't absorb · document chasing scales painfully every tax season",
    solution: {
      name: "Automated Onboarding & Document Tracking System",
      desc: "Client intake data flows directly into your accounting software with zero retyping. Document requests go out automatically, get tracked against what's received, and chase themselves until complete.",
      outcomes: [
        "Zero manual data re-entry, zero transcription errors",
        "Real-time view of who's outstanding on documents",
        "Onboarding sequence runs the same way every time",
      ],
      architectureId: "accounting-onboarding",
    },
  },
  {
    id: "online-coaching",
    abbr: "OC",
    tabTitle: "Online Coaching",
    personaTag: "The Seven-Figure Founder at Six-Figure Operations",
    header: "Growth that's outpaced the systems running it",
    subhead: "Kajabi or Teachable in place, the rest of the business running through your inbox",
    problems: [
      {
        name: "The Manual Welcome",
        desc: "A student enrols and pays. Someone sends the welcome email, manually grants access, and hopes the onboarding sequence happens the way it's supposed to — because nothing is actually enforcing it.",
        cost: "Every student, by hand",
      },
      {
        name: "The Silent Drop-Off",
        desc: "Progress check-ins either don't happen or happen when someone remembers. Students who stall don't get caught until they ask for a refund.",
        cost: "No one notices until refunds happen",
      },
    ],
    financialImpact:
      "Completion rate and refund rate are both worse than they should be · growth is capped by how much manual onboarding one founder can personally do",
    solution: {
      name: "Automated Enrolment & Engagement System",
      desc: "The moment payment clears, access is granted, the welcome sequence fires, and progress check-ins run on schedule — automatically flagging students who've gone quiet before it becomes a refund request.",
      outcomes: [
        "Onboarding runs identically for student 1 and student 1,000",
        "Stalled students flagged before they ask for a refund",
        "Founder time freed from manual enrolment tasks entirely",
      ],
      architectureId: "lifecycle-nurture",
    },
  },
  {
    id: "recruitment",
    abbr: "REC",
    tabTitle: "Recruitment",
    personaTag: "The Billing-Focused Director",
    header: "Consultants doing admin instead of billing placements",
    subhead: "An ATS that exists, surrounded by a process that ignores it",
    problems: [
      {
        name: "The CV Screening Bottleneck",
        desc: "Every application gets read and shortlisted by hand. Candidate status lives in a spreadsheet running parallel to the ATS, updated whenever someone remembers.",
        cost: "40% of the week, no placement value",
      },
      {
        name: "The Scheduling Back-and-Forth",
        desc: "Interview scheduling happens through email chains between consultant, candidate, and client — three-way coordination with no system tracking any of it.",
        cost: "Interviews lost to slow coordination",
      },
    ],
    financialImpact:
      "40% of consultant time spent on admin that generates zero placement fees · slow scheduling loses candidates to faster-moving competitors",
    solution: {
      name: "AI Screening & Scheduling Pipeline",
      desc: "Applications are screened and ranked automatically against the role brief. Shortlisted candidates move straight into an automated scheduling flow that finds time across all three calendars without a single email.",
      outcomes: [
        "40% of consultant time redirected to billable activity",
        "Screening time cut from hours to minutes",
        "Interviews booked without manual back-and-forth",
      ],
      architectureId: "recruiting-screen-schedule",
    },
  },
  {
    id: "healthcare",
    abbr: "HC",
    tabTitle: "Healthcare",
    personaTag: "The Clinic Owner-Clinician",
    header: "Admin eating into clinical hours",
    subhead: "A practice management system, surrounded by manual reminders and paper intake",
    problems: [
      {
        name: "The No-Show Drain",
        desc: "Appointment reminders go out manually or through a basic SMS tool with no follow-up logic. When a slot cancels, it sits empty instead of automatically going to someone on the waiting list.",
        cost: "Higher cancellation rate than necessary",
      },
      {
        name: "The Paper Intake Trail",
        desc: "New patients fill out forms on paper or PDF. Someone manually transfers every field into the practice management software before the first appointment even starts.",
        cost: "Re-typed into the system by hand",
      },
    ],
    financialImpact:
      "Avoidable no-shows cost clinical hours that can't be recovered · intake re-entry adds friction to every single new patient",
    solution: {
      name: "Automated Reminders & Digital Intake System",
      desc: "Reminders escalate automatically as appointments approach. Cancelled slots offer themselves to the waiting list within minutes. New patient forms feed straight into your practice management software — no retyping.",
      outcomes: [
        "No-show rate reduced through smarter, escalating reminders",
        "Cancelled slots refilled automatically",
        "Zero manual intake data entry",
      ],
      architectureId: "clinic-intake-reminders",
    },
  },
];

export const workflowArchitectures: WorkflowArchitecture[] = [
  {
    id: "lead-crm",
    letter: "A",
    title: "New lead in. System responds and routes it.",
    industries: ["Real Estate", "Sales"],
    trigger: "Someone fills in a form, sends a message, or enquires through any channel",
    aiAction: "The system reads the enquiry, checks fit, and decides who should handle it",
    systemAction: "A reply goes out within 2 minutes. The right person is notified. The contact record updates with no typing.",
    outcome: "Every lead gets a reply in under 2 minutes. Nothing forgotten. No manual entry.",
  },
  {
    id: "document-intake",
    letter: "B",
    title: "Client sends a document. It files itself.",
    industries: ["Legal", "Accounting", "Healthcare"],
    trigger: "A client uploads a form, emails a document, or completes intake online",
    aiAction: "The system reads the document, pulls key details, and flags anything missing",
    systemAction: "Information goes into the right record. The client gets confirmation. Missing items trigger a reminder.",
    outcome: "No re-typing. No missing documents. Records stay complete.",
  },
  {
    id: "lifecycle-nurture",
    letter: "C",
    title: "Milestone hit. Follow-up runs on its own.",
    industries: ["Consulting", "Coaching"],
    trigger: "Onboarding finishes, a milestone is reached, or 90 days pass without contact",
    aiAction: "The system sends a check-in that references their actual situation",
    systemAction: "If a reply needs a human, your team is flagged. Renewals go out on time. Nothing waits on someone remembering.",
    outcome: "Clients feel looked after. Renewals happen without chasing.",
  },
  {
    id: "reporting-insights",
    letter: "D",
    title: "New data in. Report writes and sends itself.",
    industries: ["All service businesses"],
    trigger: "End of week, end of month, or when new data lands in your tools",
    aiAction: "The system pulls numbers from sales, invoicing, and project tools and spots what changed",
    systemAction: "A summary goes to whoever needs it. Key changes post to your team channel. No one builds a spreadsheet.",
    outcome: "Current numbers every week. Decisions from real data. About 4 hrs/month saved on reports.",
  },
  {
    id: "legal-intake-engagement",
    letter: "E",
    title: "Enquiry in. Qualification, booking, engagement letter drafted.",
    industries: ["Law"],
    trigger: "A new enquiry arrives via form or email",
    aiAction: "Qualifies the matter and routes it to the right partner",
    systemAction:
      "Books the consult, drafts the engagement letter from intake data, and tracks signature status automatically",
    outcome:
      "Form submission triggers AI qualification → auto-routes to partner → drafts engagement letter → tracks signature status",
  },
  {
    id: "lead-to-docs",
    letter: "F",
    title: "Lead captured. Response instant. Docs chased and tracked.",
    industries: ["Mortgage"],
    trigger: "A lead arrives from a site, referral, or your contact form",
    aiAction: "Qualifies the lead and personalizes the first response",
    systemAction:
      "Sends a document checklist and keeps it updated with automatic reminders until complete",
    outcome:
      "New lead triggers instant qualification and response → personalized document checklist sent → auto-tracked until complete",
  },
  {
    id: "accounting-onboarding",
    letter: "G",
    title: "Client onboarded. Data synced. Docs tracked and chased.",
    industries: ["Accounting"],
    trigger: "A new client completes intake",
    aiAction: "Validates details and flags anything missing",
    systemAction:
      "Syncs intake into the accounting platform, generates a document checklist, and sends auto-reminders until received",
    outcome:
      "Intake form data syncs directly to your accounting platform → automated document checklist → auto-reminders until received",
  },
  {
    id: "recruiting-screen-schedule",
    letter: "H",
    title: "Application screened. Shortlist routed. Interviews scheduled automatically.",
    industries: ["Recruitment"],
    trigger: "A candidate applies for a role",
    aiAction: "Screens and ranks candidates against role criteria",
    systemAction:
      "Routes the shortlist to the consultant and schedules interviews across calendars without email back-and-forth",
    outcome:
      "Application triggers AI screening against role criteria → shortlist auto-routes to consultant → scheduling link sent and confirmed automatically",
  },
  {
    id: "clinic-intake-reminders",
    letter: "I",
    title: "Appointment booked. Reminders escalate. Intake syncs automatically.",
    industries: ["Healthcare"],
    trigger: "An appointment is booked or updated",
    aiAction: "Detects risk of no-show and adapts reminder timing",
    systemAction:
      "Runs reminder sequence, offers cancellations to waitlist, and syncs digital intake into practice software",
    outcome:
      "Appointment booked triggers reminder sequence → cancellation auto-offers slot to waitlist → digital intake syncs directly to practice software",
  },
];
