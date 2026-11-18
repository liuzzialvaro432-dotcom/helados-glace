import { MODELS } from "../data/models";
import type { RuntimeResponse, UserPreferences } from "../types/catalog";
import { applyDocumentLocale, t } from "../utils/i18n";
import { log } from "../utils/logger";
import { sendMessage } from "../utils/messaging";
import { DEFAULT_PREFERENCES } from "../utils/storage";

const asPreferences = (
  response: RuntimeResponse,
): UserPreferences | null =>
  response.ok && "preferences" in response ? response.preferences : null;

const localeSelect = document.querySelector<HTMLSelectElement>("#locale");
const categorySelect =
  document.querySelector<HTMLSelectElement>("#default-category");
const scopeSelect = document.querySelector<HTMLSelectElement>("#default-scope");
const favoritesSummary =
  document.querySelector<HTMLParagraphElement>("#favorites-summary");
const clearFavorites =
  document.querySelector<HTMLButtonElement>("#clear-favorites");
const openPdf = document.querySelector<HTMLButtonElement>("#open-pdf");
const saveStatus = document.querySelector<HTMLParagraphElement>("#save-status");

if (
  !localeSelect ||
  !categorySelect ||
  !scopeSelect ||
  !favoritesSummary ||
  !clearFavorites ||
  !openPdf ||
  !saveStatus
) {
  throw new Error("Options DOM is incomplete");
}

let preferences: UserPreferences = { ...DEFAULT_PREFERENCES };

const setStatus = (message: string): void => {
  saveStatus.textContent = message;
};

const refreshFavoritesSummary = (): void => {
  const names = MODELS.filter((model) =>
    preferences.favoriteIds.includes(model.id),
  ).map((model) => model.name);

  favoritesSummary.textContent =
    names.length === 0
      ? t("noFavorites") || "Keine Favoriten gesetzt."
      : `${names.length}: ${names.join(", ")}`;
};

const hydrateForm = (): void => {
  localeSelect.value = preferences.localeOverride;
  categorySelect.value = preferences.categoryFilter;
  scopeSelect.value = preferences.scopeFilter;
  refreshFavoritesSummary();
};

const persist = async (patch: Partial<UserPreferences>): Promise<void> => {
  const response = await sendMessage({
    type: "SET_PREFERENCES",
    payload: patch,
  });
  const next = asPreferences(response);

  if (next) {
    preferences = next;
    applyDocumentLocale(preferences);
    refreshFavoritesSummary();
    setStatus(t("saved") || "Gespeichert");
    return;
  }

  setStatus(t("saveFailed") || "Speichern fehlgeschlagen");
};

const boot = async (): Promise<void> => {
  const response = await sendMessage({ type: "GET_PREFERENCES" });
  const loaded = asPreferences(response);
  if (loaded) {
    preferences = loaded;
  }

  applyDocumentLocale(preferences);
  hydrateForm();

  localeSelect.addEventListener("change", () => {
    void persist({
      localeOverride: localeSelect.value as UserPreferences["localeOverride"],
    });
  });

  categorySelect.addEventListener("change", () => {
    void persist({
      categoryFilter: categorySelect.value as UserPreferences["categoryFilter"],
    });
  });

  scopeSelect.addEventListener("change", () => {
    void persist({
      scopeFilter: scopeSelect.value as UserPreferences["scopeFilter"],
    });
  });

  clearFavorites.addEventListener("click", () => {
    void persist({ favoriteIds: [] });
  });

  openPdf.addEventListener("click", () => {
    void sendMessage({ type: "OPEN_PDF" });
  });

  log("info", "options ready");
};

void boot().catch((error: unknown) => {
  log("error", "options boot failed", {
    error: error instanceof Error ? error.message : "unknown",
  });
  setStatus(t("bootFailed") || "Optionen konnten nicht geladen werden.");
});
