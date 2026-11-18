import { CATEGORIES } from "../data/categories";
import { AGENCY_ROUTING, MODELS } from "../data/models";
import type {
  Category,
  ModelEntry,
  RuntimeResponse,
  ScopeFilter,
  UserPreferences,
} from "../types/catalog";
import { filterModels } from "../utils/filter";
import { applyDocumentLocale, t } from "../utils/i18n";
import { log } from "../utils/logger";
import { copyText, sendMessage } from "../utils/messaging";
import { DEFAULT_PREFERENCES } from "../utils/storage";

const asPreferences = (
  response: RuntimeResponse,
): UserPreferences | null =>
  response.ok && "preferences" in response ? response.preferences : null;

const app = document.querySelector<HTMLDivElement>("#app");
const searchInput = document.querySelector<HTMLInputElement>("#search");
const categoryFilters = document.querySelector<HTMLDivElement>("#category-filters");
const scopeFilters = document.querySelector<HTMLDivElement>("#scope-filters");
const results = document.querySelector<HTMLElement>("#results");
const status = document.querySelector<HTMLParagraphElement>("#status");
const routingList = document.querySelector<HTMLOListElement>("#routing-list");
const detail = document.querySelector<HTMLDivElement>("#detail");
const detailTitle = document.querySelector<HTMLHeadingElement>("#detail-title");
const detailBody = document.querySelector<HTMLDivElement>("#detail-body");
const closeDetail = document.querySelector<HTMLButtonElement>("#close-detail");
const openPdf = document.querySelector<HTMLButtonElement>("#open-pdf");
const openOptions = document.querySelector<HTMLButtonElement>("#open-options");
const toast = document.querySelector<HTMLDivElement>("#toast");

if (
  !app ||
  !searchInput ||
  !categoryFilters ||
  !scopeFilters ||
  !results ||
  !status ||
  !routingList ||
  !detail ||
  !detailTitle ||
  !detailBody ||
  !closeDetail ||
  !openPdf ||
  !openOptions ||
  !toast
) {
  throw new Error("Popup DOM is incomplete");
}

let preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
let activeModelId: string | null = null;
let toastTimer = 0;

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const showToast = (message: string): void => {
  toast.hidden = false;
  toast.textContent = message;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 1800);
};

const persist = async (patch: Partial<UserPreferences>): Promise<void> => {
  const response = await sendMessage({
    type: "SET_PREFERENCES",
    payload: patch,
  });
  const next = asPreferences(response);

  if (next) {
    preferences = next;
    return;
  }

  preferences = { ...preferences, ...patch };
  log("warn", "persisted preferences locally after messaging failure");
};

const renderRouting = (): void => {
  routingList.innerHTML = AGENCY_ROUTING.map(
    (step) => `<li>${escapeHtml(step)}</li>`,
  ).join("");
};

const renderCategoryChips = (): void => {
  const chips: Array<{ id: Category | "all"; label: string }> = [
    { id: "all", label: t("filterAll") || "Alle" },
    ...CATEGORIES.map((category) => ({
      id: category.id,
      label: category.id,
    })),
  ];

  categoryFilters.innerHTML = chips
    .map(
      (chip) => `
      <button
        type="button"
        class="chip"
        role="tab"
        data-category="${chip.id}"
        aria-selected="${preferences.categoryFilter === chip.id}"
      >
        ${escapeHtml(chip.label)}
      </button>`,
    )
    .join("");
};

const renderScopeChips = (): void => {
  const chips: Array<{ id: ScopeFilter; label: string }> = [
    { id: "all", label: t("scopeAll") || "Gesamte Liste" },
    { id: "callable", label: t("scopeCallable") || "Hier aufrufbar" },
    { id: "list-only", label: t("scopeListOnly") || "Nur in der Liste" },
  ];

  scopeFilters.innerHTML = chips
    .map(
      (chip) => `
      <button
        type="button"
        class="chip"
        data-scope="${chip.id}"
        aria-pressed="${preferences.scopeFilter === chip.id}"
      >
        ${escapeHtml(chip.label)}
      </button>`,
    )
    .join("");
};

const renderCard = (model: ModelEntry): string => {
  const isFavorite = preferences.favoriteIds.includes(model.id);
  return `
    <button type="button" class="card" data-model-id="${escapeHtml(model.id)}" aria-label="${escapeHtml(model.name)}">
      <div class="card-top">
        <h3 class="card-title">${escapeHtml(model.name)}</h3>
        <span class="badge">${escapeHtml(model.category)}</span>
      </div>
      <p class="meta">${escapeHtml(model.line)} · ${escapeHtml(model.source)}${isFavorite ? " · ★" : ""}</p>
      <div class="badges">
        ${
          model.isCallableHere
            ? `<span class="badge callable">${escapeHtml(t("badgeCallable") || "Aufrufbar")}</span>`
            : `<span class="badge">${escapeHtml(t("badgeNotCallable") || "Nicht aufrufbar")}</span>`
        }
        ${
          model.slug
            ? `<span class="badge slug">${escapeHtml(model.slug)}</span>`
            : ""
        }
      </div>
      <p class="meta">${escapeHtml(model.role)}</p>
    </button>
  `;
};

const renderResults = (): void => {
  const filtered = filterModels(MODELS, {
    category: preferences.categoryFilter,
    scope: preferences.scopeFilter,
    query: preferences.searchQuery,
    favoriteIds: preferences.favoriteIds,
  });

  status.textContent = t("resultCount", [
    String(filtered.length),
    String(MODELS.length),
  ]) || `${filtered.length} von ${MODELS.length} Modellen`;

  if (filtered.length === 0) {
    results.innerHTML = `<div class="empty" role="status">${escapeHtml(
      t("emptyResults") || "Kein Modell passt zu diesem Filter.",
    )}</div>`;
    return;
  }

  results.innerHTML = filtered.map(renderCard).join("");
};

const openDetail = (model: ModelEntry): void => {
  activeModelId = model.id;
  detail.hidden = false;
  detailTitle.textContent = model.name;

  const isFavorite = preferences.favoriteIds.includes(model.id);
  const effort =
    model.effortLevels.length > 0
      ? model.effortLevels.join(" · ")
      : t("noEffort") || "keine Effort-Suffixe";

  detailBody.innerHTML = `
    <dl class="detail-grid">
      <div><dt>${escapeHtml(t("labelCategory") || "Kategorie")}</dt><dd>${escapeHtml(model.category)}</dd></div>
      <div><dt>${escapeHtml(t("labelLine") || "Linie")}</dt><dd>${escapeHtml(model.line)}</dd></div>
      <div><dt>${escapeHtml(t("labelGeneration") || "Generation")}</dt><dd>${escapeHtml(model.generation)}</dd></div>
      <div><dt>${escapeHtml(t("labelSource") || "Herkunft")}</dt><dd>${escapeHtml(model.source)}</dd></div>
      <div><dt>${escapeHtml(t("labelSlug") || "Slug")}</dt><dd class="slug">${escapeHtml(model.slug ?? "—")}</dd></div>
      <div><dt>${escapeHtml(t("labelCallable") || "Aufruf hier")}</dt><dd>${model.isCallableHere ? "ja" : "nein"}</dd></div>
      <div><dt>${escapeHtml(t("labelEffort") || "Effort")}</dt><dd>${escapeHtml(effort)}</dd></div>
      <div><dt>Fast</dt><dd>${model.hasFastVariant ? "ja" : "nein"}</dd></div>
    </dl>
    ${
      model.quote
        ? `<blockquote class="quote"><strong>${escapeHtml(t("labelQuote") || "Wortlaut")}</strong><br/>„${escapeHtml(model.quote)}“</blockquote>`
        : ""
    }
    <p><strong>${escapeHtml(t("labelRole") || "Einsatz")}</strong> ${escapeHtml(model.role)}</p>
    <p class="meta">${escapeHtml(model.note)}</p>
    <div class="actions">
      ${
        model.slug
          ? `<button type="button" class="action-button primary" data-action="copy-slug" data-slug="${escapeHtml(model.slug)}">${escapeHtml(t("copySlug") || "Slug kopieren")}</button>`
          : ""
      }
      <button type="button" class="action-button" data-action="toggle-favorite">
        ${escapeHtml(
          isFavorite
            ? t("removeFavorite") || "Favorit entfernen"
            : t("addFavorite") || "Als Favorit",
        )}
      </button>
    </div>
  `;

  closeDetail.focus();
};

const closeDetailPanel = (): void => {
  detail.hidden = true;
  activeModelId = null;
};

const bindStaticEvents = (): void => {
  searchInput.addEventListener("input", () => {
    preferences = {
      ...preferences,
      searchQuery: searchInput.value,
    };
    renderResults();
    void persist({ searchQuery: searchInput.value });
  });

  categoryFilters.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-category]",
    );
    if (!target?.dataset.category) {
      return;
    }

    preferences = {
      ...preferences,
      categoryFilter: target.dataset.category as Category | "all",
    };
    renderCategoryChips();
    renderResults();
    void persist({ categoryFilter: preferences.categoryFilter });
  });

  scopeFilters.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-scope]",
    );
    if (!target?.dataset.scope) {
      return;
    }

    preferences = {
      ...preferences,
      scopeFilter: target.dataset.scope as ScopeFilter,
    };
    renderScopeChips();
    renderResults();
    void persist({ scopeFilter: preferences.scopeFilter });
  });

  results.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-model-id]",
    );
    if (!target?.dataset.modelId) {
      return;
    }

    const model = MODELS.find((entry) => entry.id === target.dataset.modelId);
    if (model) {
      openDetail(model);
    }
  });

  detailBody.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-action]",
    );
    if (!target || !activeModelId) {
      return;
    }

    if (target.dataset.action === "copy-slug" && target.dataset.slug) {
      void copyText(target.dataset.slug).then((ok) => {
        showToast(
          ok
            ? t("copied") || "Slug kopiert"
            : t("copyFailed") || "Kopieren fehlgeschlagen",
        );
      });
      return;
    }

    if (target.dataset.action === "toggle-favorite") {
      void sendMessage({
        type: "TOGGLE_FAVORITE",
        payload: { modelId: activeModelId },
      }).then((response) => {
        const next = asPreferences(response);
        if (!next) {
          return;
        }

        preferences = next;
        const model = MODELS.find((entry) => entry.id === activeModelId);
        if (model) {
          openDetail(model);
        }
        renderResults();
        showToast(t("favoritesUpdated") || "Favoriten aktualisiert");
      });
    }
  });

  closeDetail.addEventListener("click", closeDetailPanel);

  detail.addEventListener("click", (event) => {
    if (event.target === detail) {
      closeDetailPanel();
    }
  });

  openPdf.addEventListener("click", () => {
    const pdfUrl = chrome.runtime.getURL("Modellkatalog.pdf");
    void chrome.tabs
      .create({ url: pdfUrl })
      .then(() => undefined)
      .catch(() =>
        sendMessage({ type: "OPEN_PDF" }).then((response) => {
          if (!response.ok) {
            showToast(t("pdfFailed") || "PDF konnte nicht geöffnet werden");
          }
        }),
      );
  });

  openOptions.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      void chrome.runtime.openOptionsPage();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !detail.hidden) {
      closeDetailPanel();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
};

const boot = async (): Promise<void> => {
  const response = await sendMessage({ type: "GET_PREFERENCES" });
  const loaded = asPreferences(response);
  if (loaded) {
    preferences = loaded;
  }

  applyDocumentLocale(preferences);
  searchInput.value = preferences.searchQuery;
  renderRouting();
  renderCategoryChips();
  renderScopeChips();
  renderResults();
  bindStaticEvents();
  app.setAttribute("aria-busy", "false");
  log("info", "popup ready", { models: MODELS.length });
};

void boot().catch((error: unknown) => {
  log("error", "popup boot failed", {
    error: error instanceof Error ? error.message : "unknown",
  });
  app.setAttribute("aria-busy", "false");
  status.textContent = t("bootFailed") || "Popup konnte nicht geladen werden.";
});
