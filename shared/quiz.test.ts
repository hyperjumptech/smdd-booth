import { describe, expect, it } from "vitest";
import {
  QUESTIONS,
  RESULTS,
  leadingChoices,
  resolveResultKey,
  tallyAnswers,
  type Answer,
  type Choice,
} from "./quiz.js";

describe("quiz content", () => {
  it("has exactly 7 questions with A-E options", () => {
    expect(QUESTIONS).toHaveLength(7);
    for (const q of QUESTIONS) {
      expect(Object.keys(q.options).sort().join("")).toBe("ABCDE");
    }
  });

  it("defines all five results with hyperjump URLs", () => {
    for (const key of ["A", "B", "C", "D", "E"] as Choice[]) {
      expect(RESULTS[key].service).toBeTruthy();
      expect(RESULTS[key].url).toContain("hyperjump.tech");
      expect(RESULTS[key].tagline).toBeTruthy();
      expect(RESULTS[key].diagnosis).toBeTruthy();
      expect(RESULTS[key].solution).toBeTruthy();
    }
  });
});

describe("scoring", () => {
  it("tallies choices", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
    ];
    expect(tallyAnswers(answers)).toEqual({ A: 2, B: 1, C: 0, D: 0, E: 0 });
  });

  it("returns single leader when no tie", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "C" },
      { questionId: "q2", choice: "C" },
      { questionId: "q3", choice: "A" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(leadingChoices(tallyAnswers(answers))).toEqual(["C"]);
    expect(resolveResultKey(answers)).toBe("C");
  });

  it("detects ties and uses tiebreaker", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(leadingChoices(tallyAnswers(answers)).sort()).toEqual(["A", "B"]);
    expect(resolveResultKey(answers, "B")).toBe("B");
  });

  it("throws if tiebreaker required but missing or invalid", () => {
    const answers: Answer[] = [
      { questionId: "q1", choice: "A" },
      { questionId: "q2", choice: "A" },
      { questionId: "q3", choice: "B" },
      { questionId: "q4", choice: "B" },
      { questionId: "q5", choice: "C" },
      { questionId: "q6", choice: "D" },
      { questionId: "q7", choice: "E" },
    ];
    expect(() => resolveResultKey(answers)).toThrow();
    expect(() => resolveResultKey(answers, "C")).toThrow();
  });
});
