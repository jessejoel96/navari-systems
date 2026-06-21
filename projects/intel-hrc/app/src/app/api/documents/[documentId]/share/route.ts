import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { shareDocumentByEmail } from "@/lib/email/share-document";

type RouteCtx = { params: Promise<{ documentId: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/documents/[documentId]/share — email document to colleagues */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { documentId } = await ctx.params;
  const supabase = createServiceClient();
  const body = await req.json() as {
    emails?: string[];
    email?: string;
    message?: string;
    shared_by?: string;
  };

  const rawEmails = body.emails?.length
    ? body.emails
    : body.email
      ? body.email.split(/[,;]/).map((e) => e.trim())
      : [];

  const emails = [...new Set(rawEmails.map((e) => e.toLowerCase()).filter((e) => EMAIL_RE.test(e)))];

  if (emails.length === 0) {
    return NextResponse.json({ error: "At least one valid email is required" }, { status: 400 });
  }

  const { data: doc, error } = await supabase
    .from("library_documents")
    .select("*")
    .eq("id", documentId)
    .eq("is_archived", false)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const sharedBy = body.shared_by?.trim() || "Tina-Randa";
  const message = body.message?.trim() || undefined;

  try {
    await shareDocumentByEmail({
      to: emails,
      sharedBy,
      message,
      document: doc,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const shareRows = emails.map((email) => ({
    document_id: documentId,
    shared_with_email: email,
    shared_by: sharedBy,
    message: message ?? null,
  }));

  await supabase.from("library_document_shares").insert(shareRows);

  await supabase.from("audit_events").insert({
    event_type: "library_document_shared",
    payload: { document_id: documentId, recipients: emails, actor: sharedBy },
  });

  return NextResponse.json({ ok: true, sent_to: emails });
}
