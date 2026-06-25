import type { IcpConfig, Prospect } from "./types.js";

const TITLE_WEIGHTS: Record<string, number> = {
  founder: 20,
  "co-founder": 20,
  ceo: 18,
  owner: 18,
  "managing director": 16,
  coo: 15,
  "operations director": 15,
  "head of operations": 14,
  director: 10,
};

const INDUSTRY_BONUS = [
  "professional services",
  "real estate",
  "law",
  "financial",
  "marketing",
  "e-learning",
  "education",
];

export function scoreProspect(prospect: Prospect, icp: IcpConfig): Prospect {
  let score = 40;

  const title = (prospect.title ?? "").toLowerCase();
  for (const [needle, weight] of Object.entries(TITLE_WEIGHTS)) {
    if (title.includes(needle)) {
      score += weight;
      break;
    }
  }

  const industry = (prospect.company_industry ?? "").toLowerCase();
  if (INDUSTRY_BONUS.some((tag) => industry.includes(tag))) score += 12;
  if (icp.organization_industries.some((tag) => industry.includes(tag.toLowerCase()))) score += 8;

  if (prospect.email) score += 15;
  if (prospect.email_status === "verified" || prospect.email_status === "valid") score += 10;
  if (prospect.linkedin_url) score += 5;

  const observation =
    prospect.observation ?? (typeof prospect.raw?.observation === "string" ? prospect.raw.observation : undefined);
  if (observation && observation.length > 20) score += 12;

  const employees = Number(prospect.company_size ?? 0);
  if (employees >= 11 && employees <= 200) score += 8;

  const clamped = Math.max(0, Math.min(100, score));
  const tier = clamped >= 75 ? "hot" : clamped >= 55 ? "warm" : "cold";

  return { ...prospect, icp_score: clamped, icp_tier: tier };
}
