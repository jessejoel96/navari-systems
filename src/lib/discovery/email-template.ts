import type { DiscoveryAnswers, DiscoverySummary } from "./types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function discoveryLeadNotificationHtml(
  answers: DiscoveryAnswers,
  summary: DiscoverySummary
): string {
  const name = `${answers.firstName} ${answers.lastName}`.trim();
  const proposalBanner = answers.wantsProposal
    ? `<p style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 16px;border-radius:8px;margin:16px 0"><strong>⚠ Proposal requested</strong> — deliver a written proposal within 48 hours.</p>`
    : "";
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;padding:20px">
  <h2>New discovery consultation — ${esc(name)}</h2>
  ${proposalBanner}
  <p><strong>Company:</strong> ${esc(answers.company)}<br/>
  <strong>Email:</strong> ${esc(answers.email)}<br/>
  <strong>Phone:</strong> ${esc(answers.phone || "—")}<br/>
  <strong>Business type:</strong> ${esc(answers.businessType)}<br/>
  <strong>Field:</strong> ${esc(answers.businessField || "—")}<br/>
  <strong>Stage:</strong> ${esc(answers.businessStage || "—")}<br/>
  <strong>Client challenge:</strong> ${esc(answers.clientChallenge || "—")}<br/>
  <strong>Investment:</strong> ${esc(summary.estimatedInvestment)}<br/>
  <strong>Timeline:</strong> ${esc(summary.estimatedTimeline)}<br/>
  <strong>Urgency:</strong> ${esc(answers.urgency)}<br/>
  <strong>Proposal requested:</strong> ${answers.wantsProposal ? "Yes — 48h" : "No"}</p>
  <h3>Goals</h3>
  <ul>${answers.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
  <h3>Summary</h3>
  <p>${esc(summary.headline)}</p>
  <p>${esc(summary.qualificationNote)}</p>
</body>
</html>`;
}

export function discoveryAirtableFailureAlertHtml(
  name: string,
  email: string,
  error: string
): string {
  return `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;padding:20px">
  <h2 style="color:#b91c1c">Discovery complete failed — Airtable</h2>
  <p><strong>Prospect:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
  <pre style="background:#f1f5f9;padding:12px;border-radius:6px;white-space:pre-wrap">${esc(error)}</pre>
  <p>Session data was not saved. Follow up manually if the user retried.</p>
</body></html>`;
}
