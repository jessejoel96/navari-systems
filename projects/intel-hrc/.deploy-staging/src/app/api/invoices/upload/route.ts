/**
 * POST /api/invoices/upload
 *
 * Handles file upload to Supabase Storage and creates an invoice_files record.
 * Expects multipart form data with "file" and "invoice_id".
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const invoiceId = formData.get("invoice_id") as string | null;

  if (!file || !invoiceId) {
    return NextResponse.json(
      { error: "Missing file or invoice_id" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const storagePath = `invoices/${invoiceId}/${file.name}`;

  const { error: uploadErr } = await supabase.storage
    .from("invoice-files")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadErr) {
    return NextResponse.json(
      { error: uploadErr.message },
      { status: 500 }
    );
  }

  const { error: dbErr } = await supabase.from("invoice_files").insert({
    invoice_id: invoiceId,
    file_name: file.name,
    storage_path: storagePath,
    mime_type: file.type,
    size_bytes: buffer.length,
  });

  if (dbErr) {
    return NextResponse.json(
      { error: dbErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, path: storagePath });
}
