import { describe, expect, it } from "vitest";
import { getFallbackDiscoveryQuestions, getFallbackDiscoverySummary } from "./fallback";
import type { DiscoveryAnswers } from "./types";

const baseAnswers: DiscoveryAnswers = {
  businessType: "Consultancy",
  businessField: "Marketing & growth consulting",
  businessStage: "Growing — $50k–$250k/year",
  clientChallenge: "",
  teamSize: "11–50",
  country: "UK",
  revenue: "$250k–$1M",
  goals: ["Lead generation", "CRM"],
  dynamicQuestions: [],
  dynamicAnswers: [],
  brandRecognition: "National",
  contentFrequency: "Weekly",
  authorityGoal: "Yes",
  platforms: ["LinkedIn"],
  salesChannel: "Website",
  averageSale: "$5,000+",
  timeWasters: ["Emails", "Data entry"],
  aiMaturity: "ChatGPT",
  tools: ["HubSpot"],
  budget: "$5,000–15,000",
  urgency: "Immediately",
  firstName: "Alex",
  lastName: "Smith",
  email: "alex@agency.com",
  phone: "+44 7700 900000",
  company: "Bright Agency",
  additionalDetails: "",
  wantsProposal: false,
};

describe("getFallbackDiscoveryQuestions", () => {
  it("returns three questions with four options each", () => {
    const questions = getFallbackDiscoveryQuestions();
    expect(questions).toHaveLength(3);
    for (const q of questions) {
      expect(q.options).toHaveLength(4);
      expect(q.question.length).toBeGreaterThan(10);
    }
  });
});

describe("getFallbackDiscoverySummary", () => {
  it("includes business context and goals in the summary", () => {
    const summary = getFallbackDiscoverySummary(baseAnswers);
    expect(summary.businessBullets.some((b) => b.includes("Consultancy"))).toBe(true);
    expect(summary.goalsBullets).toContain("Lead generation");
    expect(summary.estimatedInvestment).toBeTruthy();
    expect(summary.estimatedTimeline).toBeTruthy();
  });
});
