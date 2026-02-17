import { describe, expect, it } from "vitest";
import { tracks } from "@/data/tracks";
import { CatalogSearchEngine } from "@/shared/catalogSearch";

describe("CatalogSearchEngine", () => {
  const engine = new CatalogSearchEngine(tracks);

  it("ranks exact title matches first", () => {
    const result = engine.search("Full-Stack Development", { type: "track", limit: 5 });

    expect(result.total).toBeGreaterThan(0);
    expect(result.results[0].type).toBe("track");
    expect(result.results[0].trackId).toBe("full-stack-dev");
  });

  it("supports fuzzy matching for typo-heavy queries", () => {
    const result = engine.search("machien learnng", { limit: 5 });

    expect(result.total).toBeGreaterThan(0);
    expect(result.results.some((item) => item.trackId === "ai-ml")).toBe(true);
  });

  it("filters by branch", () => {
    const result = engine.search("signals", { branch: "ece", limit: 20 });

    expect(result.total).toBeGreaterThan(0);
    expect(result.results.every((item) => item.branches.includes("ece"))).toBe(true);
  });

  it("returns only requested entity type", () => {
    const result = engine.search("deployment", { type: "course", limit: 20 });

    expect(result.total).toBeGreaterThan(0);
    expect(result.results.every((item) => item.type === "course")).toBe(true);
  });
});
