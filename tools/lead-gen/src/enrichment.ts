import { findEmail, findEmailsByDomain, hasHunterKey, verifyEmail } from "./hunter.js";
import type { IcpConfig, Prospect } from "./types.js";

export async function enrichProspect(prospect: Prospect, icp: IcpConfig): Promise<Prospect> {
  let current = { ...prospect };

  if (!hasHunterKey()) return current;

  if (
    !current.email &&
    current.company_domain &&
    current.first_name &&
    current.last_name
  ) {
    try {
      const found = await findEmail(current.company_domain, current.first_name, current.last_name);
      if (found.email) {
        current.email = found.email;
        current.email_status = found.confidence && found.confidence >= 80 ? "likely" : "guessed";
      }
    } catch {
      // continue to domain search
    }
  }

  if (!current.email && current.company_domain && icp.person_titles.length > 0) {
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

  if (current.email) {
    try {
      const verification = await verifyEmail(current.email);
      current.email_status = verification.status;
    } catch {
      // skip
    }
  }

  return current;
}
