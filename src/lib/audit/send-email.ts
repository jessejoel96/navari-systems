import { getResend } from "@/lib/resend";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendAuditEmail(params: SendEmailParams): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from = params.from ?? process.env.RESEND_FROM_EMAIL;
  if (!from) {
    return { ok: false, error: "RESEND_FROM_EMAIL is not set" };
  }

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[audit/email] Resend error:", error);
      return { ok: false, error: error.message ?? JSON.stringify(error) };
    }

    return { ok: true, id: data?.id ?? "unknown" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[audit/email] Send failed:", message);
    return { ok: false, error: message };
  }
}
