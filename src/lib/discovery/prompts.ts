import type { DiscoveryAnswers } from "./types";

function intakeBlock(answers: Partial<DiscoveryAnswers>): string {
  const lines = [
    `- Business type: ${answers.businessType ?? "Unknown"}`,
    answers.businessField ? `- Field / specialty: ${answers.businessField}` : null,
    answers.businessStage ? `- Business stage: ${answers.businessStage}` : null,
    answers.clientChallenge ? `- Client & revenue challenge: ${answers.clientChallenge}` : null,
    `- Team size: ${answers.teamSize ?? "Unknown"}`,
    `- Country: ${answers.country ?? "Unknown"}`,
    answers.revenue ? `- Annual revenue: ${answers.revenue}` : null,
    (answers.goals ?? []).length > 0 ? `- Goals: ${answers.goals!.join(", ")}` : null,
    answers.brandRecognition ? `- Brand recognition: ${answers.brandRecognition}` : null,
    answers.contentFrequency ? `- Content frequency: ${answers.contentFrequency}` : null,
    answers.authorityGoal ? `- Wants authority: ${answers.authorityGoal}` : null,
    (answers.platforms ?? []).length > 0 ? `- Platforms: ${answers.platforms!.join(", ")}` : null,
    answers.salesChannel ? `- How customers buy: ${answers.salesChannel}` : null,
    answers.averageSale ? `- Average sale: ${answers.averageSale}` : null,
    (answers.timeWasters ?? []).length > 0 ? `- Time wasters: ${answers.timeWasters!.join(", ")}` : null,
    answers.aiMaturity ? `- AI maturity: ${answers.aiMaturity}` : null,
    (answers.tools ?? []).length > 0 ? `- Tools: ${answers.tools!.join(", ")}` : null,
    answers.budget ? `- Budget range: ${answers.budget}` : null,
    answers.urgency ? `- Urgency: ${answers.urgency}` : null,
    answers.company ? `- Company: ${answers.company}` : null,
    answers.wantsProposal ? `- Requested a written proposal within 48 hours` : null,
    answers.additionalDetails ? `- Extra context: "${answers.additionalDetails}"` : null,
  ].filter(Boolean);

  const dynamic = (answers.dynamicQuestions ?? []).map((q, i) => {
    const a = answers.dynamicAnswers?.[i] ?? "";
    return `- Q: "${q.question}" → A: "${a}"`;
  });

  return [...lines, ...dynamic].join("\n");
}

export function buildDiscoveryQuestionsPrompt(answers: Partial<DiscoveryAnswers>): string {
  return `You are a senior discovery consultant at Navari Systems, a digital agency and automation firm.

A prospect completed intake:
${intakeBlock(answers)}

Generate exactly 3 targeted follow-up questions based on their goals, business type, and stage.
If they are pre-revenue, a consultancy, or unsure how to get clients, focus on offer clarity, positioning, credibility, and first-client acquisition — not enterprise-scale assumptions.

Rules:
- Each question must relate to their selected goals (especially the top 2)
- Each must have exactly 4 answer options
- Questions should uncover scope, current pain, and readiness — not generic fluff
- Plain English, no jargon
- Max 120 characters per question

Return valid JSON only:
{
  "questions": [
    { "question": "string", "options": ["string", "string", "string", "string"] },
    { "question": "string", "options": ["string", "string", "string", "string"] },
    { "question": "string", "options": ["string", "string", "string", "string"] }
  ]
}`;
}

export function buildDiscoverySummaryPrompt(answers: DiscoveryAnswers): string {
  return `You are a Navari Systems discovery consultant preparing a project brief for the sales team.

Prospect intake:
${intakeBlock(answers)}

Produce a structured discovery summary. Be specific to their answers — no generic agency speak.
If they are pre-revenue or a consultancy still building pipeline, emphasize positioning, offer clarity, credibility, lead generation, and phased first steps — not large implementation projects unless budget supports it.

Rules:
- estimatedInvestment must align with their stated budget range when provided; otherwise infer from goals and team size
- estimatedTimeline is a realistic weeks range as a string (e.g. "4–6 weeks")
- recommendedServices: 3–6 concrete Navari service lines (website, CRM, automation, SEO, etc.)
- opportunities: actionable wins, each starting with a verb
- qualificationNote: one sentence on fit and urgency for the sales team

Return valid JSON only:
{
  "headline": "string (one confident sentence: I believe I understand your business)",
  "businessBullets": ["string"],
  "goalsBullets": ["string"],
  "problemsBullets": ["string"],
  "opportunities": ["string"],
  "estimatedTimeline": "string",
  "estimatedInvestment": "string (e.g. $3,500–$5,000)",
  "recommendedServices": ["string"],
  "qualificationNote": "string"
}`;
}
