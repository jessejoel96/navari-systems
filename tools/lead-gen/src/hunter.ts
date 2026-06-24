import { optionalEnv, requireEnv } from "./env.js";

const HUNTER_BASE = "https://api.hunter.io/v2";

type HunterEmail = {
  value: string;
  type?: string;
  confidence?: number;
  first_name?: string;
  last_name?: string;
  position?: string;
};

async function hunterGet(path: string, params: Record<string, string>) {
  const key = requireEnv("HUNTER_API_KEY");
  const search = new URLSearchParams({ ...params, api_key: key });
  const response = await fetch(`${HUNTER_BASE}${path}?${search.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hunter ${path} failed (${response.status}): ${body.slice(0, 500)}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function findEmail(
  domain: string,
  firstName: string,
  lastName: string,
): Promise<{ email?: string; confidence?: number }> {
  const data = await hunterGet("/email-finder", {
    domain,
    first_name: firstName,
    last_name: lastName,
  });

  const email = (data.data as { email?: string; score?: number } | undefined)?.email;
  const confidence = (data.data as { score?: number } | undefined)?.score;
  return { email, confidence };
}

export async function verifyEmail(email: string): Promise<{ status: string; score?: number }> {
  const data = await hunterGet("/email-verifier", { email });
  const result = data.data as { status?: string; score?: number } | undefined;
  return { status: result?.status ?? "unknown", score: result?.score };
}

export async function findEmailsByDomain(domain: string): Promise<HunterEmail[]> {
  const data = await hunterGet("/domain-search", { domain });
  const emails = (data.data as { emails?: HunterEmail[] } | undefined)?.emails ?? [];
  return emails;
}

export function hasHunterKey(): boolean {
  return Boolean(optionalEnv("HUNTER_API_KEY"));
}
