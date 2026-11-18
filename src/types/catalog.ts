/** Fixed agency categories. Every model belongs to exactly one. */
export type Category = "Frontier" | "Stark" | "Alltag" | "Volumen" | "Spezial";

/** How the category assignment was determined. */
export type Source = "Angabe" | "Linie" | "Einschätzung";

/** Scope filter in the popup UI. */
export type ScopeFilter = "all" | "callable" | "list-only";

export type ModelEntry = {
  /** Display name shown in the UI. */
  id: string;
  name: string;
  category: Category;
  line: string;
  generation: string;
  family: string;
  vendor: string;
  /** API / subagent slug when available. */
  slug: string | null;
  /** Whether this session can launch the model as a subagent. */
  isCallableHere: boolean;
  effortLevels: string[];
  hasFastVariant: boolean;
  source: Source;
  /** Original wording from the user list, when present. */
  quote: string | null;
  role: string;
  note: string;
};

export type CategoryMeta = {
  id: Category;
  lines: string;
  agencyUse: string;
  description: string;
};

export type UserPreferences = {
  categoryFilter: Category | "all";
  scopeFilter: ScopeFilter;
  searchQuery: string;
  favoriteIds: string[];
  localeOverride: "system" | "de" | "en";
};

export type RuntimeMessage =
  | { type: "GET_PREFERENCES" }
  | { type: "SET_PREFERENCES"; payload: Partial<UserPreferences> }
  | { type: "TOGGLE_FAVORITE"; payload: { modelId: string } }
  | { type: "COPY_SLUG"; payload: { slug: string } }
  | { type: "OPEN_PDF" }
  | { type: "PING" };

export type RuntimeResponse =
  | { ok: true; preferences: UserPreferences }
  | { ok: true; copied: true }
  | { ok: true; pong: true }
  | { ok: false; error: string };
