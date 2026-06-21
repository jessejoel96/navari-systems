/**
 * POST /api/ocr
 *
 * Accepts a file upload (image or PDF) and runs OpenAI Vision extraction.
 * Returns structured invoice fields with confidence indicators.
 * Used by the manual upload form for AI-assisted field filling.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceFromImage } from "@/lib/ai/extract-invoice";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    const extracted = await extractInvoiceFromImage(base64, mimeType);

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json(
      { error: "OCR extraction failed" },
      { status: 500 }
    );
  }
}
