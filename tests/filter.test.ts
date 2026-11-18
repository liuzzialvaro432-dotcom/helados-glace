import { describe, expect, it } from "vitest";
import { MODELS } from "../src/data/models";
import { countByCategory, filterModels } from "../src/utils/filter";

describe("filterModels", () => {
  it("returns every model with an empty filter", () => {
    const result = filterModels(MODELS, {
      category: "all",
      scope: "all",
      query: "",
    });
    expect(result).toHaveLength(MODELS.length);
  });

  it("keeps models inside one category", () => {
    const result = filterModels(MODELS, {
      category: "Frontier",
      scope: "all",
      query: "",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((model) => model.category === "Frontier")).toBe(true);
  });

  it("limits to callable models", () => {
    const result = filterModels(MODELS, {
      category: "all",
      scope: "callable",
      query: "",
    });
    expect(result.every((model) => model.isCallableHere)).toBe(true);
    expect(result.some((model) => model.slug === "claude-fable-5-2")).toBe(true);
  });

  it("searches by slug and line", () => {
    const bySlug = filterModels(MODELS, {
      category: "all",
      scope: "all",
      query: "claude-opus-5-5",
    });
    expect(bySlug).toHaveLength(1);
    expect(bySlug[0]?.name).toBe("Claude Opus 5.5");

    const byLine = filterModels(MODELS, {
      category: "Spezial",
      scope: "all",
      query: "terra",
    });
    expect(byLine.length).toBe(2);
    expect(byLine.every((model) => model.line === "Terra")).toBe(true);
  });

  it("filters favorites only", () => {
    const result = filterModels(MODELS, {
      category: "all",
      scope: "all",
      query: "",
      favoritesOnly: true,
      favoriteIds: ["claude-sonnet-5-5"],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("claude-sonnet-5-5");
  });
});

describe("countByCategory", () => {
  it("sums to the catalog size", () => {
    const counts = countByCategory(MODELS);
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(MODELS.length);
    expect(counts.Frontier).toBe(5);
    expect(counts.Stark).toBe(4);
    expect(counts.Alltag).toBe(9);
    expect(counts.Volumen).toBe(3);
    expect(counts.Spezial).toBe(2);
  });
});
