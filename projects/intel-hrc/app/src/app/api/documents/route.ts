import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  ACCEPTED_LIBRARY_MIME,
  DOCUMENT_CATEGORIES,
  MAX_LIBRARY_FILE_BYTES,
} from "@/lib/documents/constants";
import { detectFileFormat } from "@/lib/documents/formats";

const VALID_CATEGORIES = new Set(DOCUMENT_CATEGORIES.map((c) => c.value));

function parseTags(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(/[,;]/).map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

/** GET /api/documents — list with optional filters */
export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const sp = req.nextUrl.searchParams;

  let query = supabase
    .from("library_documents")
    .select("*, entities(id, name, code)")
    .eq("is_archived", false)
    .order("document_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const category = sp.get("category");
  if (category) query = query.eq("category", category);

  const format = sp.get("format");
  if (format) query = query.eq("file_format", format);

  const tag = sp.get("tag");
  if (tag) query = query.contains("tags", [tag.toLowerCase()]);

  const entityId = sp.get("entity_id");
  if (entityId) query = query.eq("entity_id", entityId);

  const from = sp.get("from");
  if (from) query = query.gte("document_date", from);

  const to = sp.get("to");
  if (to) query = query.lte("document_date", to);

  const q = sp.get("q")?.trim();
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,file_name.ilike.%${q}%`);
  }

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

/** POST /api/documents — upload a new library document */
export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const category = (formData.get("category") as string | null)?.trim() || "other";
  const tagsRaw = formData.get("tags") as string | null;
  const documentDate = (formData.get("document_date") as string | null)?.trim() || null;
  const entityId = (formData.get("entity_id") as string | null)?.trim() || null;
  const uploadedBy = (formData.get("uploaded_by") as string | null)?.trim() || "Tina-Randa";

  if (!file || !title) {
    return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
  }

  if (!VALID_CATEGORIES.has(category as typeof DOCUMENT_CATEGORIES[number]["value"])) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (
    file.type &&
    !ACCEPTED_LIBRARY_MIME.includes(file.type as (typeof ACCEPTED_LIBRARY_MIME)[number])
  ) {
    return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (buffer.length > MAX_LIBRARY_FILE_BYTES) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
  }

  const docId = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `library/${category}/${docId}/${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from("invoice-files")
    .upload(storagePath, buffer, { contentType: file.type || "application/octet-stream", upsert: false });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const fileFormat = detectFileFormat(safeName, file.type);
  const tags = parseTags(tagsRaw);

  const { data, error: dbErr } = await supabase
    .from("library_documents")
    .insert({
      id: docId,
      title,
      description,
      category,
      tags,
      document_date: documentDate,
      file_format: fileFormat,
      storage_path: storagePath,
      file_name: safeName,
      mime_type: file.type || null,
      size_bytes: buffer.length,
      entity_id: entityId || null,
      uploaded_by: uploadedBy,
    })
    .select("*, entities(id, name, code)")
    .single();

  if (dbErr) {
    await supabase.storage.from("invoice-files").remove([storagePath]);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  await supabase.from("audit_events").insert({
    event_type: "library_document_uploaded",
    payload: { document_id: docId, title, category, file_format: fileFormat, actor: uploadedBy },
  });

  return NextResponse.json(data, { status: 201 });
}
