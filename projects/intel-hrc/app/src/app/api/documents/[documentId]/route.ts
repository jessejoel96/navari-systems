import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { DOCUMENT_CATEGORIES } from "@/lib/documents/constants";

const VALID_CATEGORIES = new Set(DOCUMENT_CATEGORIES.map((c) => c.value));

type RouteCtx = { params: Promise<{ documentId: string }> };

function parseTags(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];
  }
  if (typeof raw === "string") {
    return [...new Set(raw.split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean))];
  }
  return undefined;
}

/** GET /api/documents/[documentId] */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { documentId } = await ctx.params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("library_documents")
    .select("*, entities(id, name, code)")
    .eq("id", documentId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { data: shares } = await supabase
    .from("library_document_shares")
    .select("id, shared_with_email, shared_by, message, created_at")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ ...data, shares: shares ?? [] });
}

/** PATCH /api/documents/[documentId] — update metadata */
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { documentId } = await ctx.params;
  const supabase = createServiceClient();
  const body = await req.json() as Record<string, unknown>;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.title != null) updates.title = String(body.title).trim();
  if (body.description !== undefined) updates.description = body.description ? String(body.description).trim() : null;
  if (body.category != null) {
    const cat = String(body.category);
    if (!VALID_CATEGORIES.has(cat as typeof DOCUMENT_CATEGORIES[number]["value"])) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    updates.category = cat;
  }
  if (body.document_date !== undefined) {
    updates.document_date = body.document_date ? String(body.document_date) : null;
  }
  if (body.entity_id !== undefined) {
    updates.entity_id = body.entity_id ? String(body.entity_id) : null;
  }
  const tags = parseTags(body.tags);
  if (tags !== undefined) updates.tags = tags;
  if (body.is_archived !== undefined) updates.is_archived = Boolean(body.is_archived);

  const { data, error } = await supabase
    .from("library_documents")
    .update(updates)
    .eq("id", documentId)
    .select("*, entities(id, name, code)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    event_type: "library_document_updated",
    payload: { document_id: documentId, updates: Object.keys(updates) },
  });

  return NextResponse.json(data);
}

/** DELETE /api/documents/[documentId] — soft archive */
export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const { documentId } = await ctx.params;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("library_documents")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", documentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    event_type: "library_document_archived",
    payload: { document_id: documentId },
  });

  return NextResponse.json({ ok: true });
}
