import { NextResponse } from "next/server";
import { z } from "zod";
import { newsletterWelcomeHtml } from "@/lib/emails";
import { rateLimit } from "@/lib/rate-limit";
import { getResend } from "@/lib/resend";
import { upsertResendContact } from "@/lib/resend/contacts";
import { createServerClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Valid email is required"),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = rateLimit(`newsletter:${ip}`, 10, 3_600_000);
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

  const { email } = parsed.data;

  try {
    const supabase = createServerClient();
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email, source: "website", status: "active" },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Supabase upsert error:", dbError);
      return NextResponse.json(
        { error: "Failed to subscribe" },
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
    source: "newsletter",
  });

  if (!resendContact.ok) {
    console.error("[newsletter] Resend contact sync failed:", resendContact.error);
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "Navari Systems <hello@navari.systems>";

  try {
    const resend = getResend();
    await resend.emails.send({
      from,
      to: email,
      subject: "Welcome to The Navari Weekly",
      html: newsletterWelcomeHtml(),
    });
  } catch (err) {
    console.error("Resend error:", err);
  }

  return NextResponse.json({ success: true });
}
