export type WorkflowProblem = {
  name: string;
  desc: string;
  cost: string;
};

export type IndustryWorkflow = {
  id: string;
  abbr: string;
  title: string;
  tagline: string;
  challengeHeadline: string;
  problems: WorkflowProblem[];
  leakSummary: string;
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
    id: "real-estate",
    abbr: "RE",
    title: "Real Estate & Property",
    tagline: "Listing updates done by hand. Leads depending on someone remembering to reply.",
    challengeHeadline: "You change a price on one site. The other three still show the old number.",
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
    leakSummary: "Leads land in different inboxes. Nobody is watching all of them.",
    financialImpact: "6-8 hrs/week on duplication. 50% lower conversion when response slips past 30 minutes.",
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
    id: "professional-services",
    abbr: "PS",
    title: "Legal, Accounting & Consulting",
    tagline: "Your most expensive person is answering emails from people who may never sign.",
    challengeHeadline: "Senior staff spending Monday morning on admin that should not reach them.",
    problems: [
      {
        name: "Partners answering enquiry emails",
        desc: "Someone fills in your contact form. A senior person responds, books a call, prepares notes, and the lead does not show. That is 45 minutes of your highest-paid resource on someone who was never going to sign.",
        cost: "2-3 hrs/week on unqualified leads",
      },
      {
        name: "Typing the same information three times",
        desc: "A client fills in an intake form. Someone types it into the case system. Later the same details go into the invoice. One wrong digit and you spend a week chasing the error.",
        cost: "10+ hrs/week non-billable admin",
      },
    ],
    leakSummary: "The most expensive staff are doing the cheapest work. Revenue is delayed because admin is slow.",
    financialImpact: "10+ hrs/week non-billable. Billing errors from re-typing data.",
    solution: {
      name: "Leads filter themselves. Documents draft themselves.",
      desc: "A new enquiry comes in. The system checks fit, books the meeting, and sends confirmation without senior staff touching it. After the call, the engagement letter drafts from what was already collected. Your team reviews and sends.",
      outcomes: [
        "3 hrs/week saved per senior person",
        "Only qualified leads on the calendar",
        "Documents ready faster, no re-typing",
      ],
      architectureId: "document-intake",
    },
  },
  {
    id: "education",
    abbr: "ED",
    title: "Online Education & Coaching",
    tagline: "A student pays, then hears nothing for two days.",
    challengeHeadline: "Students drop off before they start because onboarding is manual.",
    problems: [
      {
        name: "Silence after payment",
        desc: "Someone pays for your course. They get a receipt and then nothing. An admin has to grant access, add them to the community, and send a welcome message when they get around to it.",
        cost: "Up to 30% of students never start",
      },
      {
        name: "Progress tracked on sticky notes",
        desc: "You check a spreadsheet to see if a student finished Week 1 before sending Week 2. If they go quiet, you only find out when they cancel.",
        cost: "4-6 hrs/week per coach",
      },
    ],
    leakSummary: "Students churn before they get value. The course is fine. The experience after payment is slow.",
    financialImpact: "4-6 hrs/week per coach. 20% churn from poor onboarding.",
    solution: {
      name: "Payment clears. Access goes live. The journey runs itself.",
      desc: "When payment clears, access is granted, a welcome message goes out, and the student joins the right community. The system watches progress and sends nudges when someone stalls.",
      outcomes: [
        "6 hrs/week recovered per coach",
        "20% higher course completion",
        "No manual onboarding steps",
      ],
      architectureId: "lifecycle-nurture",
    },
  },
  {
    id: "healthcare",
    abbr: "HC",
    title: "Healthcare & Therapy",
    tagline: "The front desk is calling every patient by hand to say remember tomorrow.",
    challengeHeadline: "Manual scheduling and paper intake eat the day. Patients still slip through.",
    problems: [
      {
        name: "Calling every patient to confirm",
        desc: "The front desk calls each patient the day before. When someone does not pick up, nothing tries again. A no-show means an empty slot that still cost staff time to chase.",
        cost: "15% no-show rate",
      },
      {
        name: "Re-typing what the patient already wrote",
        desc: "A patient fills in a paper form or emails a PDF. Someone types the same information into your system. One misread number and you have an error in the record with no trail.",
        cost: "5 hrs/week re-entering data",
      },
    ],
    leakSummary: "Staff do work that could run automatically, leaving less time for patients and more room for errors.",
    financialImpact: "15% no-shows. 5 hrs/week on data re-entry. Burnout from repetitive tasks.",
    solution: {
      name: "Reminders go out. Notes go in. No phone tag.",
      desc: "Confirmations and reminders send themselves, with a follow-up if there is no response. No-shows trigger a rebooking message. Intake forms go straight into your records.",
      outcomes: [
        "Fewer no-shows",
        "90% less manual data entry",
        "Complete records with a clear trail",
      ],
      architectureId: "document-intake",
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
];
