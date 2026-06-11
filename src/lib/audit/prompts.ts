import type { AuditAnswers } from "./types";

function intakeBlock(answers: Partial<AuditAnswers>): string {
  const lines = [
    `- Industry: ${answers.industry ?? "Unknown"}`,
    answers.subIndustry ? `- Sub-industry: ${answers.subIndustry}` : null,
    answers.primaryGoal ? `- Primary goal: ${answers.primaryGoal}` : null,
    answers.company ? `- Company: ${answers.company}` : null,
    answers.phone ? `- Phone: ${answers.phone}` : null,
    (answers.secondaryGoals ?? []).length > 0
      ? `- Secondary goals: ${answers.secondaryGoals!.join(", ")}`
      : null,
    `- Monthly revenue: ${answers.revenue ?? "Unknown"}`,
    `- Team size: ${answers.teamSize ?? "Unknown"}`,
    answers.workforceType ? `- Who does manual work: ${answers.workforceType}` : null,
    `- Departments with manual work: ${(answers.departments ?? []).join(", ") || "None specified"}`,
    `- Current tools: ${(answers.tools ?? []).join(", ") || "None specified"}`,
    answers.urgency ? `- Urgency: ${answers.urgency}` : null,
    answers.painPoint ? `- Pain point (their words): "${answers.painPoint}"` : null,
    (answers.selectedChallenges ?? []).length > 0
      ? `- Confirmed challenges: ${answers.selectedChallenges!.join("; ")}`
      : null,
  ].filter(Boolean);

  return lines.join("\n");
}

function hourlyRateHint(answers: Partial<AuditAnswers>): string {
  const workforce = answers.workforceType ?? "";
  if (workforce.includes("VA") || workforce.includes("offshore")) {
    return "Use $12/hr for labour cost estimates.";
  }
  if (workforce.includes("Just me")) {
    return "Use $55/hr owner opportunity cost for estimates.";
  }
  if (workforce.includes("Dedicated ops")) {
    return "Use $45/hr for labour cost estimates.";
  }
  const revenue = answers.revenue ?? "";
  if (revenue.includes("$50k") || revenue.includes("$100k")) {
    return "Use $50/hr for labour cost estimates.";
  }
  return "Use $35/hr for labour cost estimates.";
}

export function buildQuestionsPrompt(answers: Partial<AuditAnswers>): string {
  return `You are an operations analyst at Navari Systems, a business automation firm.

A business owner just completed intake:
${intakeBlock(answers)}

Generate exactly 2 targeted follow-up questions to pinpoint their highest-cost manual process.

Rules:
- Each question must be specific to their industry, sub-industry, primary goal, and pain point (if provided)
- Each must have exactly 4 answer options
- Questions must distinguish between tool fragmentation, human error, volume, or coordination issues
- If they gave a pain point, at least one question should probe that area directly
- Write questions a business owner would immediately recognise from their daily work
- No jargon. Plain, direct English.

Return valid JSON only:
{
  "questions": [
    { "question": "string", "options": ["string", "string", "string", "string"] },
    { "question": "string", "options": ["string", "string", "string", "string"] }
  ]
}`;
}

export function buildChallengesPrompt(answers: Partial<AuditAnswers>): string {
  return `You are an operations analyst at Navari Systems.

A business owner completed intake (no contact info yet):
${intakeBlock(answers)}
- Q: "${answers.dynamicQ1 ?? ""}" → A: "${answers.dynamicA1 ?? ""}"
- Q: "${answers.dynamicQ2 ?? ""}" → A: "${answers.dynamicA2 ?? ""}"

Generate exactly 8 likely operational challenges this specific business faces.

Rules:
- Each challenge is one short, specific sentence a business owner would recognise immediately
- Cover a mix: duplicate data entry, reconciliation, missing documents, email/notification failures, manual handoffs, reporting, billing, client follow-up, tool fragmentation
- Tailor to their industry, sub-industry, departments, tools, and goals
- No jargon. Plain English. Max 12 words per challenge
- Do not repeat the same idea twice

Return valid JSON only:
{ "challenges": ["string", "string", "string", "string", "string", "string", "string", "string"] }`;
}

export function buildReflectPrompt(answers: AuditAnswers): string {
  return `You are an experienced operations specialist at Navari Systems.

A business owner just completed an intake:
${intakeBlock(answers)}
- Question: "${answers.dynamicQ1}" → Answer: "${answers.dynamicA1}"
- Question: "${answers.dynamicQ2}" → Answer: "${answers.dynamicA2}"

Write a reflection that shows you understood their specific situation. Two paragraphs only.

Paragraph 1: Name their exact business type and the specific manual process you believe is costing them the most. Reference their primary goal and pain point if provided. Name the actual task (not a category). Include a specific weekly hour estimate as a number.

Paragraph 2: Name a second related bottleneck that probably feeds into the first problem, and connect it to what they want to achieve.

Rules:
- Sound like a colleague who has worked in their industry, not a consultant
- No bullet points, no headers, no jargon
- Specific and concrete — no vague descriptions
- Max 70 words per paragraph

Return valid JSON only:
{ "paragraph1": "string", "paragraph2": "string" }`;
}

export function buildAnalysisPrompt(answers: AuditAnswers): string {
  const rateHint = hourlyRateHint(answers);

  return `You are a systems architect at Navari Systems completing an operations assessment.

Business profile:
${intakeBlock(answers)}
- Q: "${answers.dynamicQ1}" → A: "${answers.dynamicA1}"
- Q: "${answers.dynamicQ2}" → A: "${answers.dynamicA2}"

Generate a complete preliminary audit. Use realistic estimates based on industry standards — these are projections, not guarantees.

${rateHint}
Frame all recommendations around their primary goal: "${answers.primaryGoal}".
${(answers.secondaryGoals ?? []).length > 0 ? `Also address secondary goals: ${answers.secondaryGoals.join(", ")}.` : ""}
If they selected challenges, the top leaks must map to their confirmed challenges: ${(answers.selectedChallenges ?? []).join("; ") || "none"}.
If they provided a pain point, the #1 leak must directly address it.
Adjust urgencyNote and recommendation based on their stated urgency: "${answers.urgency}".

Rules:
- 3 specific, named leaks (not generic categories)
- Feasibility ratings: High = can automate in under a week, Medium = 1-2 weeks, Low = complex
- Profile: "high-value" if revenue $25k+ with 3+ manual depts, "ready-to-build" if specific known process, "early-stage" if under $15k, "already-automated" if tools are connected
- Recommendation: "audit" if they need diagnosis first, "build" if the problem is clearly scoped
- urgencyNote: calculate monthly cost of NOT fixing this, calibrated to their urgency level
- capacityUpside must tie to their primary goal

Return valid JSON only:
{
  "profile": "high-value" | "ready-to-build" | "early-stage" | "already-automated",
  "reflectionText": "string (2 sentences summarising what was found)",
  "leaks": [
    {
      "rank": 1,
      "process": "string (specific task name)",
      "weeklyHours": number,
      "weeklyRevenueCost": number,
      "annualCost": number,
      "automationFeasibility": "High" | "Medium" | "Low",
      "solution": "string (one sentence on the fix)"
    }
  ],
  "totals": {
    "weeklyHours": number,
    "weeklyRevenue": number,
    "annualSavings": number,
    "capacityUpside": "string (e.g. Handle 40% more clients with same team)"
  },
  "recommendation": "audit" | "build",
  "recommendationReason": "string (2 sentences, specific to their situation and goal)",
  "urgencyNote": "string (one sentence with monthly cost of inaction)"
}`;
}
