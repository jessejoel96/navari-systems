import type { AuditAnalysis } from "./types";

export function auditResultEmailHtml(
  name: string,
  email: string,
  analysis: AuditAnalysis
): string {
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const feasibilityBadge = (f: string) => {
    const bg = f === "High" ? "#16a34a" : f === "Medium" ? "#ca8a04" : "#9ca3af";
    return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-family:monospace;">${f} Feasibility</span>`;
  };

  const leakRows = analysis.leaks
    .map(
      (l) => `
    <tr style="border-bottom:1px solid #1e2d4a;">
      <td style="padding:14px 0;vertical-align:top;width:28px;">
        <span style="font-family:monospace;color:#c8a96e;font-size:13px;">0${l.rank}</span>
      </td>
      <td style="padding:14px 0 14px 16px;vertical-align:top;">
        <div style="font-weight:600;color:#e8f0fe;margin-bottom:4px;">${l.process}</div>
        <div style="color:#94a3b8;font-size:13px;margin-bottom:8px;">${l.solution}</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px;">
          <span style="font-family:monospace;font-size:12px;color:#c8a96e;">~${l.weeklyHours} hrs/week</span>
          <span style="font-family:monospace;font-size:12px;color:#c8a96e;">${fmt(l.weeklyRevenueCost)}/week</span>
          <span style="font-family:monospace;font-size:12px;color:#c8a96e;">${fmt(l.annualCost)}/year</span>
        </div>
        ${feasibilityBadge(l.automationFeasibility)}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060f1a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:0 0 28px;">
          <div style="font-family:monospace;font-size:11px;color:#4b6180;letter-spacing:0.1em;text-transform:uppercase;">Navari Systems</div>
          <div style="font-size:22px;font-weight:700;color:#e8f0fe;margin-top:6px;">Operations Assessment</div>
          <div style="font-size:13px;color:#94a3b8;margin-top:4px;">Preliminary — Generated for ${name}</div>
        </td></tr>

        <!-- Disclaimer banner -->
        <tr><td style="padding:12px 16px;background:#0f1e33;border:1px solid #1e2d4a;border-radius:8px;margin-bottom:24px;">
          <div style="font-size:12px;color:#94a3b8;font-family:monospace;">⚠ SIMULATION &amp; ESTIMATE &nbsp;—&nbsp; These figures are projections based on industry averages. Exact costs require the full Navari Audit.</div>
        </td></tr>

        <tr><td style="padding-top:24px;"></td></tr>

        <!-- Leaks -->
        <tr><td>
          <div style="font-family:monospace;font-size:11px;color:#4b6180;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Identified Leaks</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e2d4a;">
            ${leakRows}
          </table>
        </td></tr>

        <!-- Totals -->
        <tr><td style="padding-top:28px;">
          <div style="background:#0f1e33;border:1px solid #c8a96e22;border-radius:12px;padding:20px 24px;">
            <div style="font-family:monospace;font-size:11px;color:#4b6180;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Total Recoverable</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;padding:8px 0;">
                  <div style="font-size:28px;font-weight:700;color:#c8a96e;font-family:monospace;">${analysis.totals.weeklyHours}<span style="font-size:14px;color:#94a3b8;font-weight:400;"> hrs</span></div>
                  <div style="font-size:11px;color:#4b6180;text-transform:uppercase;letter-spacing:0.08em;">Per Week</div>
                </td>
                <td style="text-align:center;padding:8px 0;">
                  <div style="font-size:28px;font-weight:700;color:#c8a96e;font-family:monospace;">${fmt(analysis.totals.weeklyRevenue)}</div>
                  <div style="font-size:11px;color:#4b6180;text-transform:uppercase;letter-spacing:0.08em;">Weekly Recovery</div>
                </td>
                <td style="text-align:center;padding:8px 0;">
                  <div style="font-size:28px;font-weight:700;color:#c8a96e;font-family:monospace;">${fmt(analysis.totals.annualSavings)}</div>
                  <div style="font-size:11px;color:#4b6180;text-transform:uppercase;letter-spacing:0.08em;">Annual Potential</div>
                </td>
              </tr>
            </table>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid #1e2d4a;font-size:13px;color:#94a3b8;">${analysis.totals.capacityUpside}</div>
          </div>
        </td></tr>

        <!-- Recommendation -->
        <tr><td style="padding-top:28px;">
          <div style="font-family:monospace;font-size:11px;color:#4b6180;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Recommendation</div>
          <div style="font-size:15px;color:#e8f0fe;line-height:1.6;">${analysis.recommendationReason}</div>
          <div style="margin-top:10px;font-size:13px;color:#c8a96e;font-style:italic;">${analysis.urgencyNote}</div>
        </td></tr>

        <!-- CTAs -->
        <tr><td style="padding-top:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 8px 0 0;" width="50%">
                <a href="https://navari.systems/audit?ref=email-cta" style="display:block;background:#c8a96e;color:#060f1a;text-align:center;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">Start the Navari Audit — $497</a>
              </td>
              <td style="padding:0 0 0 8px;" width="50%">
                <a href="https://cal.com/navari/architect" style="display:block;background:transparent;color:#e8f0fe;text-align:center;padding:14px 20px;border-radius:8px;text-decoration:none;font-size:14px;border:1px solid #1e2d4a;">Book an Architect Call</a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:40px;border-top:1px solid #1e2d4a;margin-top:40px;">
          <div style="font-size:12px;color:#4b6180;line-height:1.8;">
            This assessment was generated based on the information you provided. All estimates are projections only.<br>
            Navari Systems · <a href="https://navari.systems" style="color:#c8a96e;text-decoration:none;">navari.systems</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function auditReceivedEmailHtml(name: string): string {
  const first = name.split(" ")[0];
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#060f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060f1a;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td>
          <div style="font-family:monospace;font-size:11px;color:#4b6180;letter-spacing:0.1em;text-transform:uppercase;">Navari Systems</div>
          <div style="font-size:22px;font-weight:700;color:#e8f0fe;margin-top:8px;">We received your audit submission</div>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin-top:16px;">
            Hi ${first}, thanks for completing the intake. We are analysing your inputs now.
            Your full preliminary assessment with cost estimates will arrive in this inbox shortly.
          </p>
          <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-top:12px;">
            If you do not see the results email within a few minutes, check spam or reply to this message.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function auditLeadNotificationHtml(
  name: string,
  email: string,
  answers: Record<string, unknown>
): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:monospace;background:#060f1a;color:#e8f0fe;padding:32px;">
<h2 style="color:#c8a96e;">New audit lead</h2>
<p><strong>${name}</strong> &lt;${email}&gt;</p>
<pre style="background:#0f1e33;padding:16px;border-radius:8px;font-size:12px;overflow:auto;white-space:pre-wrap;">${JSON.stringify(answers, null, 2)}</pre>
<p style="color:#94a3b8;font-size:12px;">Navari Systems · Audit Tool</p>
</body>
</html>`;
}

export function auditAlertEmailHtml(
  name: string,
  email: string,
  reason: string,
  answers: Record<string, unknown>
): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:monospace;background:#060f1a;color:#e8f0fe;padding:32px;">
<h2 style="color:#f87171;">⚠ Audit AI Failure Alert</h2>
<p><strong>Lead captured:</strong> ${name} &lt;${email}&gt;</p>
<p><strong>Failure reason:</strong> ${reason}</p>
<pre style="background:#0f1e33;padding:16px;border-radius:8px;font-size:12px;overflow:auto;">${JSON.stringify(answers, null, 2)}</pre>
<p style="color:#94a3b8;font-size:12px;">Navari Systems · Audit Tool Alert</p>
</body>
</html>`;
}
