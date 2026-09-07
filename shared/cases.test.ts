import { describe, expect, it } from "vitest";
import {
  CASES,
  canSubmitBadges,
  countKinds,
  getCaseById,
  getCaseNumber,
  type Badge,
} from "./cases.js";

describe("CASES inventory", () => {
  it("has unique ids and required fields", () => {
    const ids = new Set<string>();
    for (const c of CASES) {
      expect(c.id.length).toBeGreaterThan(0);
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
      expect(["service", "product"]).toContain(c.kind);
      expect(c.painTitle.length).toBeGreaterThan(0);
      expect(c.hook.length).toBeGreaterThan(20);
      expect(c.clues.length).toBe(3);
      for (const clue of c.clues) {
        expect(clue.length).toBeGreaterThan(10);
      }
      expect(c.revealName.length).toBeGreaterThan(0);
      expect(c.revealBody.length).toBeGreaterThan(0);
    }
  });

  it("includes at least 5 services and 3 products", () => {
    const services = CASES.filter((c) => c.kind === "service");
    const products = CASES.filter((c) => c.kind === "product");
    expect(services.length).toBeGreaterThanOrEqual(5);
    expect(products.length).toBeGreaterThanOrEqual(3);
  });
});

describe("badge helpers", () => {
  it("countKinds and canSubmitBadges enforce 2+1", () => {
    const badges: Badge[] = [
      { caseId: "a", kind: "service", revealName: "A" },
      { caseId: "b", kind: "service", revealName: "B" },
      { caseId: "c", kind: "product", revealName: "C" },
    ];
    expect(countKinds(badges)).toEqual({ service: 2, product: 1 });
    expect(canSubmitBadges(badges)).toBe(true);
    expect(canSubmitBadges(badges.slice(0, 2))).toBe(false);
  });

  it("getCaseById returns case", () => {
    const first = CASES[0];
    expect(getCaseById(first.id)?.id).toBe(first.id);
    expect(getCaseById("missing")).toBeUndefined();
  });

  it("getCaseNumber is 1-based and 0 for unknown ids", () => {
    expect(getCaseNumber(CASES[0].id)).toBe(1);
    expect(getCaseNumber(CASES[2].id)).toBe(3);
    expect(getCaseNumber("missing")).toBe(0);
  });
});
