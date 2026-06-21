import type { EmailReceivedEvent, WebhookEventPayload } from "resend";
import { getResendClient } from "./resend-client";

export const ACCEPTED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export interface IntakeAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface IntakeEmail {
  from: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  attachments: IntakeAttachment[];
  resendEmailId?: string;
  source: "resend_webhook" | "legacy_form" | "legacy_json";
}

function isAcceptedMime(contentType: string): boolean {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  return ACCEPTED_MIME.includes(normalized);
}

/**
 * Verify and handle a Resend `email.received` webhook payload.
 * Returns null if the event is not email.received (caller should ack and skip).
 */
export async function intakeFromResendWebhook(
  rawBody: string,
  headers: Headers
): Promise<IntakeEmail | null> {
  const resend = getResendClient();
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  let event: WebhookEventPayload;

  if (secret) {
    event = resend.webhooks.verify({
      payload: rawBody,
      headers: {
        id: headers.get("svix-id") ?? "",
        timestamp: headers.get("svix-timestamp") ?? "",
        signature: headers.get("svix-signature") ?? "",
      },
      webhookSecret: secret,
    });
  } else {
    event = JSON.parse(rawBody) as WebhookEventPayload;
  }

  if (event.type !== "email.received") {
    return null;
  }

  const received = event as EmailReceivedEvent;
  return fetchResendEmail(received.data.email_id);
}

/** Fetch full email body + attachment bytes from Resend Receiving API. */
export async function fetchResendEmail(emailId: string): Promise<IntakeEmail> {
  const resend = getResendClient();

  const { data: email, error } = await resend.emails.receiving.get(emailId);
  if (error || !email) {
    throw new Error(error?.message ?? `Failed to fetch received email ${emailId}`);
  }

  const attachments: IntakeAttachment[] = [];

  for (const meta of email.attachments ?? []) {
    if (!meta.content_type || !isAcceptedMime(meta.content_type)) {
      continue;
    }

    const { data: att, error: attError } =
      await resend.emails.receiving.attachments.get({
        emailId,
        id: meta.id,
      });

    if (attError || !att?.download_url) {
      console.warn(
        `Failed to get attachment ${meta.id} for email ${emailId}:`,
        attError?.message
      );
      continue;
    }

    const fileRes = await fetch(att.download_url);
    if (!fileRes.ok) {
      console.warn(
        `Failed to download attachment ${meta.id}: HTTP ${fileRes.status}`
      );
      continue;
    }

    const content = Buffer.from(await fileRes.arrayBuffer());
    attachments.push({
      filename:
        att.filename ?? meta.filename ?? `attachment-${meta.id}`,
      content,
      contentType: att.content_type ?? meta.content_type,
    });
  }

  return {
    from: email.from,
    subject: email.subject,
    textBody: email.text ?? "",
    htmlBody: email.html ?? "",
    attachments,
    resendEmailId: emailId,
    source: "resend_webhook",
  };
}

/** Legacy JSON test payload (manual curl / Postman). */
export function intakeFromLegacyJson(json: Record<string, unknown>): IntakeEmail {
  const attachments: IntakeAttachment[] = [];

  if (Array.isArray(json.attachments)) {
    for (const att of json.attachments) {
      const item = att as Record<string, string>;
      const contentType = item.content_type || item.contentType || "";
      if (!item.content || !isAcceptedMime(contentType)) continue;

      attachments.push({
        filename: item.filename || "attachment",
        content: Buffer.from(item.content, "base64"),
        contentType,
      });
    }
  }

  return {
    from: String(json.from || ""),
    subject: String(json.subject || ""),
    textBody: String(json.text || json.body || ""),
    htmlBody: String(json.html || ""),
    attachments,
    source: "legacy_json",
  };
}

/** Legacy multipart form (local testing). */
export async function intakeFromFormData(
  formData: FormData
): Promise<IntakeEmail> {
  const attachments: IntakeAttachment[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && isAcceptedMime(value.type)) {
      const content = Buffer.from(await value.arrayBuffer());
      attachments.push({
        filename: value.name || `attachment-${key}`,
        content,
        contentType: value.type,
      });
    }
  }

  return {
    from: (formData.get("from") as string) || "",
    subject: (formData.get("subject") as string) || "",
    textBody: (formData.get("text") as string) || "",
    htmlBody: (formData.get("html") as string) || "",
    attachments,
    source: "legacy_form",
  };
}
