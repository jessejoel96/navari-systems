/**
 * GET /api/storage?path=...
 * Secure download of files from the invoice-files bucket.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const storagePath = req.nextUrl.searchParams.get("path");

  if (!storagePath || storagePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const allowedPrefixes = ["invoices/", "payment-sheets/", "sage-exports/"];
  if (!allowedPrefixes.some((p) => storagePath.startsWith(p))) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage.from("invoice-files").download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const fileName = storagePath.split("/").pop() ?? "download";
  const ext = fileName.split(".").pop()?.toLowerCase();

  const contentTypes: Record<string, string> = {
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain; charset=utf-8",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };

  const contentType = contentTypes[ext ?? ""] ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
