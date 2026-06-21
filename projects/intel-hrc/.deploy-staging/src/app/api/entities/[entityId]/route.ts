/**
 * PATCH /api/entities/[entityId]
 * Update mutable entity fields: contact_email, contact_name.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = ["contact_email", "contact_name"] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params;
  const body = await req.json() as Partial<Record<AllowedField, string>>;

  const update: Partial<Record<AllowedField, string>> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) update[field] = body[field];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("entities")
    .update(update)
    .eq("id", entityId)
    .select("id, name, code, contact_email, contact_name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
