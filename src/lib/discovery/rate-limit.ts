import { rateLimit } from "@/lib/rate-limit";

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function discoveryIpLimit(req: Request): { success: boolean; remaining: number } {
  const ip = getClientIp(req);
  return rateLimit(`discovery:ip:${ip}`, 30, 60 * 60 * 1000);
}

export function discoverySessionAiLimit(sessionId: string): { success: boolean; remaining: number } {
  return rateLimit(`discovery:ai:${sessionId}`, 8, 60 * 60 * 1000);
}

export function discoveryCompleteLimit(sessionId: string): { success: boolean; remaining: number } {
  return rateLimit(`discovery:complete:${sessionId}`, 3, 60 * 60 * 1000);
}
