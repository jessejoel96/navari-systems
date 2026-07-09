import { optionalEnv, requireEnv } from "./env.js";
import type { Prospect } from "./types.js";

export type PersonalizedEmail = {
  subject: string;
  body: string;
  hook: string;
};

const OUTREACH_METHOD = `Layer One observation-based outreach (NOT generic cold pitch):
1. Opening — one specific observation proving you studied their business (not a compliment)
2. Bridge — what that costs them (lost leads, billable hours, delayed cash, competitor advantage)
3. Offer — low-friction next step: offer to send mapped findings, never "hire me" on touch 1
Example CTA: "I mapped out three specific changes that would shift this within 60 days. Would it be useful if I sent you what I found?"
Sign-off: Jesse, Navari Systems | Title: AI Automation Specialist (not Founder in cold email)`;

const NAVARI_CONTEXT = `Navari Systems identifies the three processes costing an SMB the most time and money, then builds AI automation to eliminate them. Most clients recover 15–20 hours/week within 60 days. Entry: Navari Audit $497. Site: navari.systems`;

function prospectField(prospect: Prospect, key: "observation" | "persona" | "observation_source"): string | undefined {
  const top = prospect[key];
  if (top) return top;
  const raw = prospect.raw?.[key];
  return typeof raw === "string" ? raw : undefined;
}

function industryObservationFallback(prospect: Prospect): string | undefined {
  const industry = (prospect.company_industry ?? "").toLowerCase();
  const company = prospect.company_name ?? "your firm";

  if (industry.includes("law")) {
    return `I noticed ${company}'s intake still routes through a generic contact path with no visible automated handoff between enquiry and case setup.`;
  }
  if (industry.includes("real estate") || industry.includes("property")) {
    return `I noticed listing status on ${company}'s site doesn't appear to stay in sync with portal feeds — several properties look stale compared to major portals.`;
  }
  if (industry.includes("financial") || industry.includes("mortgage")) {
    return `I noticed ${company}'s lead capture still ends at "we'll call you back" with no visible instant follow-up or document collection path.`;
  }
  if (industry.includes("account") || industry.includes("bookkeep")) {
    return `I noticed client onboarding at ${company} still looks like email-and-attachment chase rather than a single tracked portal.`;
  }
  return undefined;
}

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
  const observation = prospectField(prospect, "observation") ?? (step === 1 ? industryObservationFallback(prospect) : undefined);
  const persona = prospectField(prospect, "persona");
  const observationNote = observation
    ? `Documented observation (MUST use in touch 1 opening): ${observation}`
    : "WARNING: No observation documented — infer from industry only if unavoidable; prefer [NEEDS RESEARCH] in hook field.";

  const stepRules =
    step === 1
      ? `Touch 1 structure: Observation opening → Bridge (cost) → Offer (send findings, not hire me). Under 120 words.`
      : step === 2
        ? `Touch 2: Reference original observation or add one proof point. Still no hard pitch. Under 90 words.`
        : `Touch 3: Final bump — restate offer to send the three-process map. Graceful close. Under 90 words.`;

  const prompt = `Write cold email step ${step} for sequence "${sequenceName}".

${OUTREACH_METHOD}

${NAVARI_CONTEXT}

Prospect:
- Name: ${prospect.full_name ?? "there"}
- Title: ${prospect.title ?? "leader"}
- Company: ${prospect.company_name ?? "their company"}
- Industry: ${prospect.company_industry ?? "professional services"}
- Persona: ${persona ?? "SMB ops leader"}
- ${observationNote}

${stepRules}

Banned: "I hope this finds you well", "I wanted to reach out", compliments without substance, "hire me" on step 1.
Return JSON only: {"subject":"...","body":"...","hook":"one-line observation opener"}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write observation-based B2B cold email for Navari Systems. Never generic pitch. Output valid JSON only.",
        },
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
  const observation =
    prospectField(prospect, "observation") ?? industryObservationFallback(prospect);

  if (step === 1) {
    const opening = observation
      ? observation
      : `[NEEDS RESEARCH] I noticed ${company} may still be running critical client workflows through manual handoffs between email, spreadsheets, and disconnected tools.`;
    const bridge =
      "That usually means hours each week vanish into non-billable admin — and leads or clients slip to whoever responds fastest.";
    const offer =
      "I mapped out three specific changes that would shift this within 60 days. Would it be useful if I sent you what I found?";

    return {
      hook: observation ?? `[NEEDS RESEARCH] manual ops at ${company}`,
      subject: observation
        ? `Re: ${company} — quick observation`
        : `[NEEDS RESEARCH] ops at ${company}`,
      body: `Hi ${name},

${opening}

${bridge}

${offer}

— Jesse, Navari Systems
AI Automation Specialist`,
    };
  }

  if (step === 2) {
    return {
      hook: `Following up — ${company}`,
      subject: `Re: ${company}`,
      body: `Hi ${name},

Circling back on my note — most firms in your space recover 15–20 hours a week once intake, follow-up, and status updates stop living in inboxes and one-off spreadsheets.

Happy to send the three-process map I mentioned — no pitch on the first pass.

— Jesse, Navari Systems`,
    };
  }

  return {
    hook: `Final note — ${company}`,
    subject: `Last note — ${company}`,
    body: `Hi ${name},

Last note from me — if trimming manual ops is on your radar this quarter, I can send the specific changes I'd make at ${company}.

Reply "send it" and I'll share what I found.

— Jesse`,
  };
}
