import { optionalEnv, requireEnv } from "./env.js";
import type { Prospect } from "./types.js";

export type PersonalizedEmail = {
  subject: string;
  body: string;
  hook: string;
};

const NAVARI_CONTEXT = `Navari Systems maps a business's three costliest manual processes and automates them at a fixed price and timeline. Target buyers: founders and ops leaders at SMBs (11–200 employees) losing time to manual workflows. Site: navari.systems`;

export function hasOpenAiKey(): boolean {
  return Boolean(optionalEnv("OPENAI_API_KEY"));
}

export async function personalizeEmail(
  prospect: Prospect,
  step: number,
  sequenceName: string,
): Promise<PersonalizedEmail> {
  if (!hasOpenAiKey()) {
    return fallbackEmail(prospect, step);
  }

  const key = requireEnv("OPENAI_API_KEY");
  const prompt = `Write cold email step ${step} for sequence "${sequenceName}".

${NAVARI_CONTEXT}

Prospect:
- Name: ${prospect.full_name ?? "there"}
- Title: ${prospect.title ?? "leader"}
- Company: ${prospect.company_name ?? "their company"}
- Industry: ${prospect.company_industry ?? "professional services"}

Rules:
- Under 120 words for step 1, under 90 for follow-ups
- One specific pain (manual ops, slow lead response, scattered tools)
- One clear CTA (reply or book at navari.systems)
- No hype, no "I hope this finds you well"
- Return JSON only: {"subject":"...","body":"...","hook":"one-line opener"}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write concise B2B cold email for Navari Systems. Output valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return fallbackEmail(prospect, step);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return fallbackEmail(prospect, step);

  try {
    return JSON.parse(content) as PersonalizedEmail;
  } catch {
    return fallbackEmail(prospect, step);
  }
}

function fallbackEmail(prospect: Prospect, step: number): PersonalizedEmail {
  const name = prospect.first_name ?? prospect.full_name?.split(" ")[0] ?? "there";
  const company = prospect.company_name ?? "your team";

  if (step === 1) {
    return {
      hook: `Manual ops at ${company}`,
      subject: `Quick question about ops at ${company}`,
      body: `Hi ${name},

Most ${prospect.title ?? "ops leaders"} I talk to are still losing hours each week to manual intake, follow-ups, and status checks — work that never shows up on the P&L until you add it up.

Navari maps your three costliest manual processes and automates them at a fixed price and timeline.

Worth a 15-minute look? Reply here or grab time at navari.systems.

— Jesse, Navari Systems`,
    };
  }

  return {
    hook: `Following up — ${company}`,
    subject: `Re: ops at ${company}`,
    body: `Hi ${name},

Circling back — if manual workflows are still eating time at ${company}, I can send a 2-minute overview of how we scope and fix the top three.

Interested?

— Jesse`,
  };
}
