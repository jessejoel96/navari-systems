import { describe, expect, it } from "vitest";
import { discoveryAnswersSchema, discoverySummarySchema } from "./schema";

describe("discoveryAnswersSchema", () => {
  const valid = {
    businessType: "Consultancy",
    businessField: "Management & strategy consulting",
    businessStage: "Pre-revenue — just starting out",
    clientChallenge: "Don't know what to offer or sell yet",
    teamSize: "2–10",
    country: "Cameroon",
    revenue: "",
    goals: ["Lead generation"],
    dynamicQuestions: [],
    dynamicAnswers: [],
    brandRecognition: "Local recognition",
    contentFrequency: "Sometimes",
    authorityGoal: "Yes",
    platforms: ["LinkedIn"],
    salesChannel: "Website",
    averageSale: "$500–5,000",
    timeWasters: ["Emails"],
    aiMaturity: "ChatGPT",
    tools: ["Google"],
    budget: "$1,500–5,000",
    urgency: "This month",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "",
    company: "Acme Co",
    additionalDetails: "",
    wantsProposal: true,
  };

  it("accepts a complete intake payload", () => {
    expect(discoveryAnswersSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing goals", () => {
    const result = discoveryAnswersSchema.safeParse({ ...valid, goals: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = discoveryAnswersSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("discoverySummarySchema", () => {
  it("accepts a well-formed AI summary", () => {
    const result = discoverySummarySchema.safeParse({
      headline: "I understand your business.",
      businessBullets: ["Agency · 12 people"],
      goalsBullets: ["Lead generation"],
      problemsBullets: ["Manual follow-up"],
      opportunities: ["CRM implementation"],
      estimatedTimeline: "6 weeks",
      estimatedInvestment: "$3,500–$5,000",
      recommendedServices: ["CRM", "SEO"],
      qualificationNote: "Warm lead — follow up this week.",
    });
    expect(result.success).toBe(true);
  });
});
