import type { IcpConfig } from "../types.js";

export function buildDiscoveryQueries(icp: IcpConfig): string[] {
  const titles = icp.person_titles.slice(0, 3).join(" OR ");
  const industries = icp.organization_industries.slice(0, 2).join(" ");
  const locations = icp.person_locations.slice(0, 2).join(" ");
  const keywords = (icp.keywords ?? []).slice(0, 2).join(" ");

  const queries = [
    `${titles} ${industries} ${locations} founder CEO operations`,
    `${industries} company ${locations} "about us" team leadership`,
    `site:linkedin.com/in ${titles} ${industries} ${locations}`,
  ];

  if (keywords) {
    queries.push(`${industries} ${keywords} ${locations} contact email`);
  }

  return [...new Set(queries.map((q) => q.replace(/\s+/g, " ").trim()))];
}
