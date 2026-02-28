import { beforeEach, describe, expect, it } from "vitest";
import { getLearnerDnaSummary, recordPracticeExecution } from "@/services/learnerProfileService";
import type { ExecuteTestResult } from "@/services/codeExecutionService";
import { safeStorage } from "@/lib/safeStorage";

describe("learnerProfileService", () => {
  beforeEach(() => {
    safeStorage.clear();
  });

  it("records executions and computes dna summary", () => {
    const successfulResults: ExecuteTestResult[] = [
      {
        testCase: 1,
        passed: true,
        statusId: 3,
        statusDescription: "Accepted",
        input: "{}",
        expectedOutput: "{}",
        stdout: "{}",
      },
    ];

    recordPracticeExecution("user-1", {
      branch: "cse",
      problemId: "problem-a",
      problemTitle: "Two Sum",
      language: "javascript",
      results: successfulResults,
      passedTests: 1,
      totalTests: 1,
      tookMs: 120,
    });

    const summary = getLearnerDnaSummary("user-1", "cse");
    expect(summary.streak).toBe(1);
    expect(summary.totalRuns).toBe(1);
    expect(summary.solvedProblems).toBe(1);
    expect(summary.acceptanceRate).toBe(100);
    expect(summary.strongestLanguage).toBe("javascript");
  });
});
