import { findEmail as hunterFindEmail, findEmailsByDomain, hasHunterKey, verifyEmail } from "./hunter.js";
import { enrichProspectWithRenidly, hasRenidlyKey } from "./renidly.js";
import { findEmail as snovFindEmail, hasSnovKey } from "./snov.js";
import type { IcpConfig, Prospect } from "./types.js";

function mergeEnriched(base: Prospect, patch: Prospect): Prospect {
  return {
    ...base,
    ...patch,
    email: patch.email ?? base.email,
    email_status: patch.email_status ?? base.email_status,
    company_name: patch.company_name ?? base.company_name,
    company_domain: patch.company_domain ?? base.company_domain,
    company_industry: patch.company_industry ?? base.company_industry,
    title: patch.title ?? base.title,
    linkedin_url: patch.linkedin_url ?? base.linkedin_url,
    source: base.source.includes(patch.source) ? base.source : `${base.source}+${patch.source}`,
    raw: { ...base.raw, ...patch.raw },
  };
}

export async function enrichProspect(prospect: Prospect, icp: IcpConfig): Promise<Prospect> {
  let current = { ...prospect };

  if (hasRenidlyKey()) {
    try {
      current = mergeEnriched(current, await enrichProspectWithRenidly(current));
    } catch {
      // continue with email waterfall
    }
  }

  if (
    !current.email &&
    hasHunterKey() &&
    current.company_domain &&
    current.first_name &&
    current.last_name
  ) {
    try {
      const found = await hunterFindEmail(
        current.company_domain,
        current.first_name,
        current.last_name,
      );
      if (found.email) {
        current.email = found.email;
        current.email_status = found.confidence && found.confidence >= 80 ? "likely" : "guessed";
      }
    } catch {
      // continue to domain search
    }
  }

  if (!current.email && hasSnovKey() && current.company_domain && current.first_name && current.last_name) {
    try {
      const found = await snovFindEmail(
        current.company_domain,
        current.first_name,
        current.last_name,
      );
      if (found.email) {
        current.email = found.email;
        current.email_status =
          found.status === "valid" ? "valid" : found.status === "unknown" ? "guessed" : found.status;
      }
    } catch {
      // continue
    }
  }

  if (!current.email && hasHunterKey() && current.company_domain && icp.person_titles.length > 0) {
    try {
      const emails = await findEmailsByDomain(current.company_domain);
      const titleNeedle = icp.person_titles[0]?.toLowerCase() ?? "";
      const match =
        emails.find((e) => e.position?.toLowerCase().includes(titleNeedle.split(" ")[0] ?? "")) ??
        emails[0];

      if (match?.value) {
        current.email = match.value;
        current.first_name = current.first_name ?? match.first_name;
        current.last_name = current.last_name ?? match.last_name;
        current.full_name =
          current.full_name ??
          ([match.first_name, match.last_name].filter(Boolean).join(" ") || undefined);
        current.title = current.title ?? match.position;
        current.email_status = match.confidence && match.confidence >= 80 ? "likely" : "guessed";
      }
    } catch {
      // skip
    }
  }

  if (current.email && hasHunterKey()) {
    try {
      const verification = await verifyEmail(current.email);
      current.email_status = verification.status;
    } catch {
      // skip
    }
  }

  return current;
}
