import type { DiscoveryAnswers, DiscoverySummary, DynamicQuestion } from "./types";

const FALLBACK_QUESTIONS: DynamicQuestion[] = [
  {
    question: "What is the main outcome you need in the next 90 days?",
    options: [
      "More qualified leads",
      "A better website or brand presence",
      "Less manual work for my team",
      "A new system or app built",
    ],
  },
  {
    question: "What is blocking you from getting there today?",
    options: [
      "No time to manage it",
      "Tools don't talk to each other",
      "Don't know what to build first",
      "Tried before and it didn't work",
    ],
  },
  {
    question: "Who will be involved in this project on your side?",
    options: [
      "Just me deciding",
      "Me plus 1–2 stakeholders",
      "A small internal team",
      "Need agency to lead end-to-end",
    ],
  },
];

export function getFallbackDiscoveryQuestions(): DynamicQuestion[] {
  return FALLBACK_QUESTIONS;
}

export function getFallbackDiscoverySummary(answers: DiscoveryAnswers): DiscoverySummary {
  const goals = answers.goals.slice(0, 4);
  const problems = answers.timeWasters.slice(0, 3);

  return {
    headline: "I believe I understand your business and what you are trying to achieve.",
    businessBullets: [
      `${answers.businessType}${answers.businessField ? ` · ${answers.businessField}` : ""} · ${answers.teamSize} people · ${answers.country}`,
      answers.businessStage ? `Stage: ${answers.businessStage}` : null,
      answers.clientChallenge ? `Client challenge: ${answers.clientChallenge}` : null,
      answers.revenue ? `Revenue band: ${answers.revenue}` : "Revenue not disclosed",
      `AI experience: ${answers.aiMaturity}`,
    ].filter((b): b is string => Boolean(b)),
    goalsBullets: goals.length > 0 ? goals : ["Clarify digital and automation priorities"],
    problemsBullets:
      problems.length > 0
        ? problems.map((p) => `Too much time lost to ${p.toLowerCase()}`)
        : ["Manual processes slowing growth"],
    opportunities: [
      "Clarify the highest-impact project to start with",
      "Map tools and workflows before building",
      "Define a phased rollout that matches budget and urgency",
    ],
    estimatedTimeline: answers.urgency === "Immediately" ? "4–6 weeks" : "6–10 weeks",
    estimatedInvestment: answers.budget !== "Not sure" && answers.budget ? answers.budget : "$3,500–$8,000",
    recommendedServices: goals.slice(0, 4).length > 0 ? goals.slice(0, 4) : ["Discovery workshop", "Implementation roadmap"],
    qualificationNote: `Prospect from ${answers.company}; urgency: ${answers.urgency || "unspecified"}${answers.wantsProposal ? "; WANTS PROPOSAL IN 48H" : ""}. Review manually.`,
  };
}
