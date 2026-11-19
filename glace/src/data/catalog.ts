import raw from "@/data/catalog.json";

export type OptionItem = { id: number; name: string; price: number };

export type OptionGroup = {
  id: number;
  /** "multi": varios sabores hasta `max`; "single": una sola opción obligatoria. */
  kind: "multi" | "single";
  /** null = sin tope definido en el catálogo. */
  max: number | null;
  items: OptionItem[];
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  previousPrice: number | null;
  categoryId: number;
  image: string | null;
  featured: boolean;
  optionGroups: OptionGroup[];
};

export type Category = {
  id: number;
  name: string;
  image: string | null;
  productIds: number[];
};

export type OrderBranch = { id: number; name: string };

export type Shift = { open: string; close: string };

type Catalog = {
  syncedAt: string;
  orderBranches: OrderBranch[];
  /** Índice 0 = domingo. */
  weeklyHours: Shift[][];
  featuredIds: number[];
  categories: Category[];
  products: Product[];
};

const catalog = raw as Catalog;

export const PRODUCTS: Product[] = catalog.products;
export const CATEGORIES: Category[] = catalog.categories;
export const ORDER_BRANCHES: OrderBranch[] = catalog.orderBranches;
export const WEEKLY_HOURS: Shift[][] = catalog.weeklyHours;

const productsById = new Map(PRODUCTS.map((product) => [product.id, product]));

export function getProduct(id: number): Product | undefined {
  return productsById.get(id);
}

export const FEATURED_PRODUCTS: Product[] = catalog.featuredIds
  .map((id) => productsById.get(id))
  .filter((product): product is Product => Boolean(product));

export function productsOf(category: Category): Product[] {
  return category.productIds
    .map((id) => productsById.get(id))
    .filter((product): product is Product => Boolean(product));
}

export function smallImage(image: string): string {
  return image.replace(/\.webp$/, "-sm.webp");
}

/** Nombres cortos para la barra de categorías; si falta uno se usa el nombre completo. */
const CATEGORY_SHORT_NAMES: Record<number, string> = {
  12907: "Imperdible",
  5973: "Helados",
  8880: "Tortas",
  5974: "Delifree",
  11561: "Tortas Delifree",
  5975: "Postres y copas",
  5971: "Date el gustito",
};

export function categoryShortName(category: Category): string {
  return CATEGORY_SHORT_NAMES[category.id] ?? category.name;
}

export function categoryLabelOf(product: Product): string {
  const category = CATEGORIES.find((item) => item.id === product.categoryId);
  return category ? categoryShortName(category) : "";
}

export function categoryAnchor(category: Category): string {
  return `categoria-${category.id}`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(product: Product, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(`${product.name} ${product.description}`);
  return terms.every((term) => haystack.includes(term));
}
