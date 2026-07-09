export type DynamicQuestion = {
  question: string;
  options: string[];
};

export type DiscoveryAnswers = {
  businessType: string;
  businessField: string;
  businessStage: string;
  clientChallenge: string;
  teamSize: string;
  country: string;
  revenue: string;
  goals: string[];
  dynamicQuestions: DynamicQuestion[];
  dynamicAnswers: string[];
  brandRecognition: string;
  contentFrequency: string;
  authorityGoal: string;
  platforms: string[];
  salesChannel: string;
  averageSale: string;
  timeWasters: string[];
  aiMaturity: string;
  tools: string[];
  budget: string;
  urgency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  additionalDetails: string;
  wantsProposal: boolean;
};

export type DiscoverySummary = {
  headline: string;
  businessBullets: string[];
  goalsBullets: string[];
  problemsBullets: string[];
  opportunities: string[];
  estimatedTimeline: string;
  estimatedInvestment: string;
  recommendedServices: string[];
  qualificationNote: string;
};

export type DiscoverySessionRecord = {
  id: string;
  sessionId: string;
  publicToken: string;
  status: "in_progress" | "completed" | "failed";
  answersJson: string;
  summaryJson: string | null;
  contactEmail: string | null;
  contactName: string | null;
  company: string | null;
  estimatedInvestment: string | null;
  estimatedTimeline: string | null;
  createdAt: string;
  completedAt: string | null;
};
