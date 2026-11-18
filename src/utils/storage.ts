import type { UserPreferences } from "../types/catalog";
import { log } from "./logger";

export const STORAGE_KEY = "modellkatalog.preferences.v1";

export const DEFAULT_PREFERENCES: UserPreferences = {
  categoryFilter: "all",
  scopeFilter: "all",
  searchQuery: "",
  favoriteIds: [],
  localeOverride: "system",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * Validates and merges stored preferences with defaults.
 */
export const sanitizePreferences = (raw: unknown): UserPreferences => {
  if (!isObject(raw)) {
    return { ...DEFAULT_PREFERENCES };
  }

  const categoryFilter =
    raw.categoryFilter === "all" ||
    raw.categoryFilter === "Frontier" ||
    raw.categoryFilter === "Stark" ||
    raw.categoryFilter === "Alltag" ||
    raw.categoryFilter === "Volumen" ||
    raw.categoryFilter === "Spezial"
      ? raw.categoryFilter
      : DEFAULT_PREFERENCES.categoryFilter;

  const scopeFilter =
    raw.scopeFilter === "all" ||
    raw.scopeFilter === "callable" ||
    raw.scopeFilter === "list-only"
      ? raw.scopeFilter
      : DEFAULT_PREFERENCES.scopeFilter;

  const localeOverride =
    raw.localeOverride === "system" ||
    raw.localeOverride === "de" ||
    raw.localeOverride === "en"
      ? raw.localeOverride
      : DEFAULT_PREFERENCES.localeOverride;

  const favoriteIds = Array.isArray(raw.favoriteIds)
    ? raw.favoriteIds.filter((id): id is string => typeof id === "string")
    : [];

  const searchQuery =
    typeof raw.searchQuery === "string" ? raw.searchQuery.slice(0, 120) : "";

  return {
    categoryFilter,
    scopeFilter,
    searchQuery,
    favoriteIds,
    localeOverride,
  };
};

/**
 * Reads preferences from chrome.storage.sync with a local fallback.
 */
export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return sanitizePreferences(result[STORAGE_KEY]);
  } catch (error) {
    log("warn", "sync storage unavailable, falling back to local", {
      error: error instanceof Error ? error.message : "unknown",
    });

    try {
      const local = await chrome.storage.local.get(STORAGE_KEY);
      return sanitizePreferences(local[STORAGE_KEY]);
    } catch (localError) {
      log("error", "failed to load preferences", {
        error: localError instanceof Error ? localError.message : "unknown",
      });
      return { ...DEFAULT_PREFERENCES };
    }
  }
};

/**
 * Persists preferences to sync storage, with local fallback when offline/quota fails.
 */
export const savePreferences = async (
  preferences: UserPreferences,
): Promise<UserPreferences> => {
  const next = sanitizePreferences(preferences);

  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: next });
    return next;
  } catch (error) {
    log("warn", "sync save failed, writing local copy", {
      error: error instanceof Error ? error.message : "unknown",
    });
    await chrome.storage.local.set({ [STORAGE_KEY]: next });
    return next;
  }
};

/**
 * Toggles a model id in the favorites list.
 */
export const toggleFavoriteId = (
  preferences: UserPreferences,
  modelId: string,
): UserPreferences => {
  const hasFavorite = preferences.favoriteIds.includes(modelId);
  const favoriteIds = hasFavorite
    ? preferences.favoriteIds.filter((id) => id !== modelId)
    : [...preferences.favoriteIds, modelId];

  return { ...preferences, favoriteIds };
};
