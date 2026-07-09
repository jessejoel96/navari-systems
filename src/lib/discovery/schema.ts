import { z } from "zod";

export const discoveryAnswersSchema = z.object({
  businessType: z.string().min(1).max(100),
  businessField: z.string().max(200).default(""),
  businessStage: z.string().max(200).default(""),
  clientChallenge: z.string().max(200).default(""),
  teamSize: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  revenue: z.string().max(100).default(""),
  goals: z.array(z.string()).min(1),
  dynamicQuestions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
      })
    )
    .default([]),
  dynamicAnswers: z.array(z.string()).default([]),
  brandRecognition: z.string().max(200).default(""),
  contentFrequency: z.string().max(200).default(""),
  authorityGoal: z.string().max(200).default(""),
  platforms: z.array(z.string()).default([]),
  salesChannel: z.string().max(200).default(""),
  averageSale: z.string().max(200).default(""),
  timeWasters: z.array(z.string()).default([]),
  aiMaturity: z.string().max(200).default(""),
  tools: z.array(z.string()).default([]),
  budget: z.string().max(200).default(""),
  urgency: z.string().max(200).default(""),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).default(""),
  company: z.string().min(1).max(200),
  additionalDetails: z.string().max(2000).default(""),
  wantsProposal: z.boolean().default(false),
});

/** Partial intake for mid-flow AI calls (before contact capture). */
export const discoveryIntakePartialSchema = discoveryAnswersSchema
  .omit({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    company: true,
  })
  .partial()
  .extend({
    goals: z.array(z.string()).optional(),
  });

export const discoverySummarySchema = z.object({
  headline: z.string(),
  businessBullets: z.array(z.string()),
  goalsBullets: z.array(z.string()),
  problemsBullets: z.array(z.string()),
  opportunities: z.array(z.string()),
  estimatedTimeline: z.string(),
  estimatedInvestment: z.string(),
  recommendedServices: z.array(z.string()),
  qualificationNote: z.string(),
});
