import { getResend } from "@/lib/resend";

export type ResendContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  source?: string;
};

export async function upsertResendContact(
  input: ResendContactInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Email is required" };
  }

  const properties: Record<string, string> = {};
  if (input.company) properties.company = input.company;
  if (input.phone) properties.phone = input.phone;
  if (input.source) properties.source = input.source;

  const segmentId = process.env.RESEND_SEGMENT_ID;

  const base = {
    email,
    firstName: input.firstName?.trim() || undefined,
    lastName: input.lastName?.trim() || undefined,
    unsubscribed: false,
    ...(Object.keys(properties).length > 0 ? { properties } : {}),
    ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
  };

  try {
    const resend = getResend();
    const { error } = await resend.contacts.create(base);

    if (!error) {
      return { ok: true };
    }

    const message = error.message ?? JSON.stringify(error);
    const exists =
      message.toLowerCase().includes("already") ||
      message.toLowerCase().includes("duplicate") ||
      error.name === "validation_error";

    if (!exists) {
      console.error("[resend/contacts] create failed:", error);
      return { ok: false, error: message };
    }

    const { error: updateError } = await resend.contacts.update({
      email,
      firstName: base.firstName,
      lastName: base.lastName,
      unsubscribed: false,
      ...(Object.keys(properties).length > 0 ? { properties } : {}),
    });

    if (updateError) {
      console.error("[resend/contacts] update failed:", updateError);
      return { ok: false, error: updateError.message ?? JSON.stringify(updateError) };
    }

    if (segmentId) {
      const { data: contact } = await resend.contacts.get({ email });
      if (contact?.id) {
        await resend.contacts.segments.add({
          contactId: contact.id,
          segmentId,
        });
      }
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resend/contacts] unexpected error:", message);
    return { ok: false, error: message };
  }
}
