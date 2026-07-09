import { describe, expect, it } from "vitest";
import { discoveryCompleteLimit, discoveryIpLimit, discoverySessionAiLimit } from "./rate-limit";

function mockRequest(ip = "203.0.113.10"): Request {
  return new Request("http://localhost/api/discovery/session", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("discovery rate limits", () => {
  it("allows first request from an IP", () => {
    const ip = `test-ip-${Date.now()}-a`;
    const req = mockRequest(ip);
    expect(discoveryIpLimit(req).success).toBe(true);
  });

  it("caps AI calls per session", () => {
    const session = `sess-${Date.now()}`;
    for (let i = 0; i < 8; i++) {
      expect(discoverySessionAiLimit(session).success).toBe(true);
    }
    expect(discoverySessionAiLimit(session).success).toBe(false);
  });

  it("caps complete attempts per session", () => {
    const session = `complete-${Date.now()}`;
    expect(discoveryCompleteLimit(session).success).toBe(true);
    expect(discoveryCompleteLimit(session).success).toBe(true);
    expect(discoveryCompleteLimit(session).success).toBe(true);
    expect(discoveryCompleteLimit(session).success).toBe(false);
  });
});
