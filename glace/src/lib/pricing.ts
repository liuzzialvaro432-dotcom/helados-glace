import { getProduct, type Product } from "@/data/catalog";
import { activePricePromo, type PricePromo } from "@/data/promotions";
import { checkCoupon, type Coupon } from "@/lib/coupons";
import type { LocalTime } from "@/lib/time";

/** groupId → ids de las opciones elegidas */
export type Selections = Record<number, number[]>;

export type CartLine = {
  key: string;
  productId: number;
  quantity: number;
  selections: Selections;
  note: string;
};

export type PricedLine = {
  line: CartLine;
  product: Product;
  optionNames: string[];
  /** Precio unitario de lista (sin promo), con opciones. */
  listUnit: number;
  /** Precio unitario a cobrar, con opciones. */
  unit: number;
  total: number;
  promo: PricePromo | null;
};

export type OrderSummary = {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  /** Ahorro por promos de precio ya incluido en el subtotal. */
  promoSavings: number;
  coupon: Coupon | null;
  discount: number;
  total: number;
};

export function lineKey(productId: number, selections: Selections, note: string): string {
  const options = Object.keys(selections)
    .map(Number)
    .sort((a, b) => a - b)
    .map((groupId) => `${groupId}:${[...selections[groupId]].sort((a, b) => a - b).join(",")}`)
    .join("|");
  return `${productId}#${options}#${note.trim().toLowerCase()}`;
}

function selectedItems(product: Product, selections: Selections) {
  return product.optionGroups.flatMap((group) => {
    const chosen = selections[group.id] ?? [];
    return group.items.filter((item) => chosen.includes(item.id));
  });
}

export function priceProduct(product: Product, selections: Selections, local: LocalTime | null) {
  const items = selectedItems(product, selections);
  const options = items.reduce((sum, item) => sum + item.price, 0);
  const promo = activePricePromo(product.id, local) ?? null;
  const base = promo && promo.price < product.price ? promo.price : product.price;
  return {
    optionNames: items.map((item) => item.name),
    listUnit: product.price + options,
    unit: base + options,
    promo: base < product.price ? promo : null,
  };
}

/** null cuando la selección es válida; si no, el mensaje a mostrar. */
export function selectionError(product: Product, selections: Selections): string | null {
  for (const group of product.optionGroups) {
    const count = (selections[group.id] ?? []).length;
    if (count === 0) return group.kind === "single" ? "Elegí una opción." : "Elegí al menos un sabor.";
    if (group.max !== null && count > group.max) return `Podés elegir hasta ${group.max}.`;
  }
  return null;
}

/** Sin `now` (antes de la hidratación) no se aplica ningún cupón: no se puede saber si venció. */
export function summarizeOrder(
  lines: CartLine[],
  local: LocalTime | null,
  coupon: Coupon | null = null,
  now: Date | null = null,
): OrderSummary {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product) continue;
    const price = priceProduct(product, line.selections, local);
    priced.push({ line, product, ...price, total: price.unit * line.quantity });
  }

  const subtotal = priced.reduce((sum, item) => sum + item.total, 0);
  const promoSavings = priced.reduce((sum, item) => sum + (item.listUnit - item.unit) * item.line.quantity, 0);
  const applied = coupon && now && checkCoupon(coupon, subtotal, now).ok ? coupon : null;
  const discount = applied ? Math.min(applied.value, subtotal) : 0;

  return {
    lines: priced,
    itemCount: priced.reduce((sum, item) => sum + item.line.quantity, 0),
    subtotal,
    promoSavings,
    coupon: applied,
    discount,
    total: subtotal - discount,
  };
}
