import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  sanitizePreferences,
  toggleFavoriteId,
} from "../src/utils/storage";

describe("sanitizePreferences", () => {
  it("returns defaults for invalid payloads", () => {
    expect(sanitizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences("nope")).toEqual(DEFAULT_PREFERENCES);
  });

  it("keeps known fields and drops unknown category values", () => {
    const result = sanitizePreferences({
      categoryFilter: "Mystery",
      scopeFilter: "callable",
      searchQuery: "opus",
      favoriteIds: ["claude-opus-5-5", 12, "gpt-5-6-sol"],
      localeOverride: "en",
      extra: true,
    });

    expect(result.categoryFilter).toBe("all");
    expect(result.scopeFilter).toBe("callable");
    expect(result.searchQuery).toBe("opus");
    expect(result.favoriteIds).toEqual(["claude-opus-5-5", "gpt-5-6-sol"]);
    expect(result.localeOverride).toBe("en");
  });
});

describe("toggleFavoriteId", () => {
  it("adds and removes a favorite id", () => {
    const withFavorite = toggleFavoriteId(DEFAULT_PREFERENCES, "composer-2-5");
    expect(withFavorite.favoriteIds).toContain("composer-2-5");

    const withoutFavorite = toggleFavoriteId(withFavorite, "composer-2-5");
    expect(withoutFavorite.favoriteIds).not.toContain("composer-2-5");
  });
});
