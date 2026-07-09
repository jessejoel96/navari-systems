import { optionalEnv, requireEnv } from "./env.js";

const SNOV_TOKEN_URL = "https://api.snov.io/v1/oauth/access_token";
const SNOV_BASE = "https://api.snov.io/v2";

type SnovToken = {
  access_token: string;
  expires_at: number;
};

let cachedToken: SnovToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at - 60_000) {
    return cachedToken.access_token;
  }

  const clientId = requireEnv("SNOV_CLIENT_ID");
  const clientSecret = requireEnv("SNOV_CLIENT_SECRET");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(SNOV_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Snov auth failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.access_token;
}

async function snovPost(path: string, payload: unknown) {
  const token = await getAccessToken();
  const response = await fetch(`${SNOV_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Snov POST ${path} failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

async function snovGet(path: string, params: Record<string, string>) {
  const token = await getAccessToken();
  const url = new URL(`${SNOV_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Snov GET ${path} failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasSnovKey(): boolean {
  return Boolean(optionalEnv("SNOV_CLIENT_ID") && optionalEnv("SNOV_CLIENT_SECRET"));
}

export async function findEmail(
  domain: string,
  firstName: string,
  lastName: string,
): Promise<{ email?: string; status?: string }> {
  const start = await snovPost("/emails-by-domain-by-name/start", {
    rows: [{ first_name: firstName, last_name: lastName, domain }],
  });

  const taskHash = (start.data as { task_hash?: string } | undefined)?.task_hash;
  if (!taskHash) return {};

  for (let attempt = 0; attempt < 12; attempt++) {
    await sleep(attempt === 0 ? 1500 : 2000);
    const result = await snovGet("/emails-by-domain-by-name/result", { task_hash: taskHash });
    const status = result.status as string | undefined;

    if (status !== "completed") continue;

    const rows = result.data as Array<{
      result?: Array<{ email?: string; smtp_status?: string }>;
    }>;

    const match = rows?.[0]?.result?.[0];
    if (!match?.email) return {};

    return {
      email: match.email,
      status: match.smtp_status ?? "snov",
    };
  }

  return {};
}
