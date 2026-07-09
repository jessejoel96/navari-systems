import { NextResponse } from "next/server";
import { createDiscoverySession, discoveryStorageReady } from "@/lib/airtable/discovery";
import { discoveryIpLimit } from "@/lib/discovery/rate-limit";

export async function POST(req: Request) {
  const limit = discoveryIpLimit(req);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  if (!discoveryStorageReady()) {
    return NextResponse.json(
      { error: "Discovery is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID." },
      { status: 503 }
    );
  }

  try {
    const session = await createDiscoverySession();
    return NextResponse.json({
      recordId: session.recordId,
      sessionId: session.sessionId,
      publicToken: session.publicToken,
    });
  } catch (err) {
    console.error("[discovery/session] error:", err);
    return NextResponse.json({ error: "Could not start session" }, { status: 500 });
  }
}
