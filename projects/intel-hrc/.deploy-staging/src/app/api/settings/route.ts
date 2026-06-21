/**
 * GET  /api/settings   — fetch all system settings
 * PATCH /api/settings  — update one or more settings by key
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("group_name")
    .order("key");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json() as Record<string, string>;

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ error: "No settings provided" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value,
    updated_at: now,
  }));

  const { error } = await supabase
    .from("system_settings")
    .upsert(updates, { onConflict: "key", ignoreDuplicates: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, updated: Object.keys(body) });
}
