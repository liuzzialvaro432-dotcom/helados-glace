import type { Category, ModelEntry, ScopeFilter } from "../types/catalog";

export type CatalogFilter = {
  category: Category | "all";
  scope: ScopeFilter;
  query: string;
  favoritesOnly?: boolean;
  favoriteIds?: readonly string[];
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase("de-DE");

/**
 * Filters the catalog by category, callable scope, search text, and favorites.
 */
export const filterModels = (
  models: readonly ModelEntry[],
  filter: CatalogFilter,
): ModelEntry[] => {
  const query = normalize(filter.query);

  return models.filter((model) => {
    if (filter.category !== "all" && model.category !== filter.category) {
      return false;
    }

    if (filter.scope === "callable" && !model.isCallableHere) {
      return false;
    }

    if (filter.scope === "list-only" && model.isCallableHere) {
      return false;
    }

    if (filter.favoritesOnly) {
      const favorites = filter.favoriteIds ?? [];
      if (!favorites.includes(model.id)) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const haystack = [
      model.name,
      model.category,
      model.line,
      model.family,
      model.vendor,
      model.slug ?? "",
      model.role,
      model.note,
      model.source,
      model.quote ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase("de-DE");

    return haystack.includes(query);
  });
};

/**
 * Counts models per fixed category for summary chips.
 */
export const countByCategory = (
  models: readonly ModelEntry[],
): Record<Category, number> => {
  const counts: Record<Category, number> = {
    Frontier: 0,
    Stark: 0,
    Alltag: 0,
    Volumen: 0,
    Spezial: 0,
  };

  for (const model of models) {
    counts[model.category] += 1;
  }

  return counts;
};
