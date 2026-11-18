import type { UserPreferences } from "../types/catalog";

/**
 * Resolves chrome.i18n message with safe fallback to the key.
 */
export const t = (messageName: string, substitutions?: string | string[]): string => {
  try {
    const value = chrome.i18n.getMessage(messageName, substitutions);
    return value || messageName;
  } catch {
    return messageName;
  }
};

/**
 * Applies document language from preferences or browser UI language.
 */
export const applyDocumentLocale = (preferences: UserPreferences): void => {
  const uiLanguage = chrome.i18n.getUILanguage();
  const resolved =
    preferences.localeOverride === "system"
      ? uiLanguage.toLowerCase().startsWith("de")
        ? "de"
        : "en"
      : preferences.localeOverride;

  document.documentElement.lang = resolved;
  document.documentElement.dir = ["ar", "he", "fa", "ur"].some((code) =>
    resolved.startsWith(code),
  )
    ? "rtl"
    : "ltr";
};
