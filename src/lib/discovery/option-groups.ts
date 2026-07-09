import {
  BUSINESS_FIELDS,
  BUSINESS_TYPES,
  GOALS,
  PLATFORMS,
  TIME_WASTERS,
  TOOLS,
} from "./options";

/** Primary chips shown first; selecting one reveals related options. */
export type ProgressiveGroup = {
  id: string;
  label: string;
  options: readonly string[];
};

export const BUSINESS_TYPE_PRIMARY = [
  "Consultancy",
  "Startup",
  "Small Business",
  "Agency",
  "SaaS",
  "Other",
] as const;

export const BUSINESS_TYPE_MORE = BUSINESS_TYPES.filter(
  (t) => !(BUSINESS_TYPE_PRIMARY as readonly string[]).includes(t)
);

const FIELD_BY_TYPE: Record<string, readonly string[]> = {
  Consultancy: [
    "Management & strategy consulting",
    "IT & technology consulting",
    "Marketing & growth consulting",
    "HR & people consulting",
    "Financial & accounting consulting",
    "Legal & compliance consulting",
    "Coaching & training",
    "Professional services (other)",
    "Still figuring it out",
    "Other",
  ],
  Startup: [
    "Software / SaaS",
    "Ecommerce / retail",
    "Creative / design",
    "Healthcare & wellness",
    "Education & training",
    "Still figuring it out",
    "Other",
  ],
  Agency: [
    "Marketing & growth consulting",
    "Creative / design",
    "IT & technology consulting",
    "Professional services (other)",
    "Other",
  ],
  SaaS: ["Software / SaaS", "IT & technology consulting", "Other"],
  Ecommerce: ["Ecommerce / retail", "Creative / design", "Other"],
  Healthcare: ["Healthcare & wellness", "Other"],
  Education: ["Education & training", "Coaching & training", "Other"],
  "Real Estate": ["Real estate", "Other"],
  "Small Business": [
    "Ecommerce / retail",
    "Professional services (other)",
    "Creative / design",
    "Healthcare & wellness",
    "Still figuring it out",
    "Other",
  ],
};

export function fieldsForBusinessType(businessType: string): readonly string[] {
  return FIELD_BY_TYPE[businessType] ?? BUSINESS_FIELDS;
}

export const GOAL_GROUPS: ProgressiveGroup[] = [
  {
    id: "starting",
    label: "Just starting",
    options: [
      "Get my first clients",
      "Define my offer & positioning",
      "Build credibility online",
      "Not sure what I need yet",
    ],
  },
  {
    id: "web",
    label: "Website & brand",
    options: ["Build a website", "Improve current website", "Branding", "SEO"],
  },
  {
    id: "growth",
    label: "Growth & sales",
    options: ["Lead generation", "Sales", "Marketing", "Social media", "CRM"],
  },
  {
    id: "ai",
    label: "AI & automation",
    options: [
      "AI automation",
      "Workflow automation",
      "AI chatbot",
      "AI voice agent",
      "Customer support",
    ],
  },
  {
    id: "build",
    label: "Build software",
    options: [
      "Internal software",
      "Mobile app",
      "Custom software",
      "Data dashboards",
      "Something else",
    ],
  },
];

/** Related goal group ids unlocked after selecting from a group. */
export const GOAL_RELATED: Record<string, string[]> = {
  starting: ["web", "growth"],
  web: ["growth", "ai"],
  growth: ["ai", "web"],
  ai: ["build", "growth"],
  build: ["ai", "growth"],
};

export function goalGroupId(goal: string): string | null {
  for (const g of GOAL_GROUPS) {
    if ((g.options as readonly string[]).includes(goal)) return g.id;
  }
  return null;
}

export function visibleGoalOptions(selected: string[]): {
  groups: ProgressiveGroup[];
  showMoreHint: boolean;
} {
  if (selected.length === 0) {
    return {
      groups: GOAL_GROUPS.filter((g) => g.id === "starting" || g.id === "web" || g.id === "growth"),
      showMoreHint: true,
    };
  }

  const unlocked = new Set<string>();
  for (const goal of selected) {
    const id = goalGroupId(goal);
    if (!id) continue;
    unlocked.add(id);
    for (const related of GOAL_RELATED[id] ?? []) unlocked.add(related);
  }

  // Always keep selected options' groups visible
  const groups = GOAL_GROUPS.filter((g) => unlocked.has(g.id));
  const allVisible = groups.length >= GOAL_GROUPS.length;
  return { groups, showMoreHint: !allVisible };
}

export const PLATFORM_PRIMARY = [
  "LinkedIn",
  "Instagram",
  "Facebook",
  "Email",
  "YouTube",
] as const;

export const PLATFORM_MORE = PLATFORMS.filter(
  (p) => !(PLATFORM_PRIMARY as readonly string[]).includes(p)
);

export const TIME_WASTER_PRIMARY = [
  "Emails",
  "Meetings",
  "Data entry",
  "Customer support",
  "Scheduling",
  "Other",
] as const;

export const TIME_WASTER_MORE = TIME_WASTERS.filter(
  (t) => !(TIME_WASTER_PRIMARY as readonly string[]).includes(t)
);

export const TOOL_PRIMARY = [
  "Google",
  "Microsoft",
  "Slack",
  "HubSpot",
  "Notion",
  "Other",
] as const;

export const TOOL_MORE = TOOLS.filter(
  (t) => !(TOOL_PRIMARY as readonly string[]).includes(t)
);

export { GOALS };
