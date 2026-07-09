import { describe, expect, it } from "vitest";
import {
  fieldsForBusinessType,
  visibleGoalOptions,
  BUSINESS_TYPE_PRIMARY,
} from "./option-groups";

describe("fieldsForBusinessType", () => {
  it("returns consultancy-focused fields for Consultancy", () => {
    const fields = fieldsForBusinessType("Consultancy");
    expect(fields).toContain("Management & strategy consulting");
    expect(fields.length).toBeLessThanOrEqual(10);
  });

  it("falls back for unknown types", () => {
    const fields = fieldsForBusinessType("Manufacturing");
    expect(fields.length).toBeGreaterThan(5);
  });
});

describe("visibleGoalOptions", () => {
  it("starts with a short set of groups", () => {
    const { groups, showMoreHint } = visibleGoalOptions([]);
    expect(groups.length).toBeLessThanOrEqual(3);
    expect(showMoreHint).toBe(true);
  });

  it("unlocks related groups after selection", () => {
    const { groups } = visibleGoalOptions(["Get my first clients"]);
    const ids = groups.map((g) => g.id);
    expect(ids).toContain("starting");
    expect(ids).toContain("web");
  });
});

describe("BUSINESS_TYPE_PRIMARY", () => {
  it("keeps the first screen short", () => {
    expect(BUSINESS_TYPE_PRIMARY.length).toBeLessThanOrEqual(6);
  });
});
