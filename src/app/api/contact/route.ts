import { NextResponse } from "next/server";
import { z } from "zod";
import {
  contactAutoReplyHtml,
  contactNotificationHtml,
} from "@/lib/emails";
import { rateLimit } from "@/lib/rate-limit";
import { getResend } from "@/lib/resend";
import { upsertResendContact } from "@/lib/resend/contacts";
import { createServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  company: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  service_interest: z.string().max(100).optional(),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = rateLimit(`contact:${ip}`, 5, 3_600_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, company, industry, service_interest, message } =
    parsed.data;

  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? name;
  const lastName = nameParts.slice(1).join(" ") || undefined;

  try {
    const supabase = createServerClient();
    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name,
      first_name: firstName,
      last_name: lastName ?? null,
      email,
      company: company ?? null,
      industry: industry ?? null,
      service_interest: service_interest ?? null,
      message,
      source: "website",
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  const resendContact = await upsertResendContact({
    email,
    firstName,
    lastName,
    company: company ?? undefined,
    source: "contact-form",
  });

  if (!resendContact.ok) {
    console.error("[contact] Resend contact sync failed:", resendContact.error);
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Navari Systems <hello@navari.systems>";
  const notifyTo = process.env.NOTIFICATION_EMAIL ?? "jesse@navari.systems";

  try {
    const resend = getResend();
    await Promise.all([
      resend.emails.send({
        from,
        to: notifyTo,
        subject: `New contact: ${name}`,
        html: contactNotificationHtml({
          name,
          email,
          company,
          industry,
          service_interest,
          message,
        }),
      }),
      resend.emails.send({
        from,
        to: email,
        subject: "We received your message — Navari Systems",
        html: contactAutoReplyHtml(name),
      }),
    ]);
  } catch (err) {
    console.error("Resend error:", err);
  }

  return NextResponse.json({ success: true });
}
