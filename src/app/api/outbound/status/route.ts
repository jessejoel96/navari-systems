import { NextRequest, NextResponse } from "next/server";
import { getOutboundDashboardData, isOutboundAuthorized } from "@/lib/outbound/dashboard-data";

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-lead-secret");
  if (!isOutboundAuthorized(request.nextUrl.searchParams, key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getOutboundDashboardData();
  return NextResponse.json(data);
}
