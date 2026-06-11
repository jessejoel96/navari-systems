export type AuditAnswers = {
  industry: string;
  subIndustry: string;
  primaryGoal: string;
  secondaryGoals: string[];
  revenue: string;
  teamSize: string;
  workforceType: string;
  departments: string[];
  tools: string[];
  dynamicQ1: string;
  dynamicA1: string;
  dynamicQ2: string;
  dynamicA2: string;
  suggestedChallenges: string[];
  selectedChallenges: string[];
  urgency: string;
  painPoint: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
};

export type DynamicQuestion = {
  question: string;
  options: string[];
};

export type LeakItem = {
  rank: number;
  process: string;
  weeklyHours: number;
  weeklyRevenueCost: number;
  annualCost: number;
  automationFeasibility: "High" | "Medium" | "Low";
  solution: string;
};

export type AuditProfile =
  | "high-value"
  | "ready-to-build"
  | "early-stage"
  | "already-automated";

export type AuditAnalysis = {
  profile: AuditProfile;
  reflectionText: string;
  leaks: LeakItem[];
  totals: {
    weeklyHours: number;
    weeklyRevenue: number;
    annualSavings: number;
    capacityUpside: string;
  };
  recommendation: "audit" | "build";
  recommendationReason: string;
  urgencyNote: string;
};
