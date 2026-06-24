import { optionalEnv, requireEnv } from "../env.js";

const BRAVE_BASE = "https://api.search.brave.com/res/v1/web/search";

export type BraveResult = {
  title: string;
  url: string;
  description: string;
};

export function hasBraveKey(): boolean {
  return Boolean(optionalEnv("BRAVE_API_KEY"));
}

export async function braveSearch(query: string, count = 20): Promise<BraveResult[]> {
  const key = requireEnv("BRAVE_API_KEY");
  const params = new URLSearchParams({ q: query, count: String(count) });

  const response = await fetch(`${BRAVE_BASE}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": key,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brave search failed (${response.status}): ${body.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
  };

  return (data.web?.results ?? [])
    .filter((r) => r.url && r.title)
    .map((r) => ({
      title: r.title!,
      url: r.url!,
      description: r.description ?? "",
    }));
}
