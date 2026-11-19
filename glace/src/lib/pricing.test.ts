import { describe, expect, it } from "vitest";

import { getProduct } from "@/data/catalog";
import { createCoupon } from "@/lib/coupons";
import { lineKey, priceProduct, selectionError, summarizeOrder, type CartLine } from "@/lib/pricing";
import type { LocalTime } from "@/lib/time";

const KILO = 52298;
const thursday: LocalTime = { year: 2026, month: 11, day: 19, weekday: 4, hour: 15, minute: 0 };
const friday: LocalTime = { ...thursday, day: 20, weekday: 5 };
const kilo = getProduct(KILO)!;
const flavours = kilo.optionGroups[0];

function line(productId: number, quantity: number, selections: CartLine["selections"] = {}): CartLine {
  return { key: lineKey(productId, selections, ""), productId, quantity, selections, note: "" };
}

describe("lineKey", () => {
  it("no depende del orden en que se eligieron los sabores", () => {
    expect(lineKey(1, { 5: [3, 1, 2] }, "")).toBe(lineKey(1, { 5: [1, 2, 3] }, ""));
  });

  it("separa el mismo producto con sabores o notas distintas", () => {
    expect(lineKey(1, { 5: [1] }, "")).not.toBe(lineKey(1, { 5: [2] }, ""));
    expect(lineKey(1, {}, "sin tapa")).not.toBe(lineKey(1, {}, ""));
  });
});

describe("priceProduct", () => {
  it("cobra el precio de lista fuera del día de promo", () => {
    const price = priceProduct(kilo, {}, friday);
    expect(price.unit).toBe(69000);
    expect(price.promo).toBeNull();
  });

  it("aplica Jueves de Glacé los jueves", () => {
    const price = priceProduct(kilo, {}, thursday);
    expect(price.unit).toBe(55000);
    expect(price.listUnit).toBe(69000);
    expect(price.promo?.id).toBe("jueves-de-glace");
  });

  it("usa el precio de lista si todavía no se conoce la hora del local", () => {
    expect(priceProduct(kilo, {}, null).unit).toBe(69000);
  });

  it("devuelve los nombres de los sabores elegidos", () => {
    const chosen = flavours.items.slice(0, 2);
    const price = priceProduct(kilo, { [flavours.id]: chosen.map((item) => item.id) }, friday);
    expect(price.optionNames).toEqual(chosen.map((item) => item.name));
  });
});

describe("selectionError", () => {
  it("exige al menos un sabor", () => {
    expect(selectionError(kilo, {})).toBe("Elegí al menos un sabor.");
  });

  it("rechaza más sabores que el máximo", () => {
    const tooMany = flavours.items.slice(0, (flavours.max ?? 0) + 1).map((item) => item.id);
    expect(selectionError(kilo, { [flavours.id]: tooMany })).toBe(`Podés elegir hasta ${flavours.max}.`);
  });

  it("acepta una selección válida", () => {
    expect(selectionError(kilo, { [flavours.id]: [flavours.items[0].id] })).toBeNull();
  });
});

describe("summarizeOrder", () => {
  const now = new Date("2026-11-20T15:00:00Z");
  const coupon = createCoupon({ id: "t", name: "T", minOrder: 0, value: 10000, redeemMin: 60000 }, now, "GLACE-TEST22");

  it("suma líneas y cuenta unidades", () => {
    const summary = summarizeOrder([line(KILO, 2)], friday);
    expect(summary.subtotal).toBe(138000);
    expect(summary.itemCount).toBe(2);
    expect(summary.total).toBe(138000);
  });

  it("informa el ahorro de la promo del día", () => {
    const summary = summarizeOrder([line(KILO, 2)], thursday);
    expect(summary.subtotal).toBe(110000);
    expect(summary.promoSavings).toBe(28000);
  });

  it("descuenta un cupón válido", () => {
    const summary = summarizeOrder([line(KILO, 1)], friday, coupon, now);
    expect(summary.discount).toBe(10000);
    expect(summary.total).toBe(59000);
    expect(summary.coupon?.code).toBe("GLACE-TEST22");
  });

  it("ignora el cupón si el pedido no llega al mínimo", () => {
    const summary = summarizeOrder([line(KILO, 1)], thursday, coupon, now);
    expect(summary.subtotal).toBe(55000);
    expect(summary.discount).toBe(0);
    expect(summary.coupon).toBeNull();
  });

  it("ignora un cupón vencido o ya usado", () => {
    const later = new Date("2027-02-01T00:00:00Z");
    expect(summarizeOrder([line(KILO, 1)], friday, coupon, later).discount).toBe(0);
    const used = { ...coupon, usedAt: now.toISOString() };
    expect(summarizeOrder([line(KILO, 1)], friday, used, now).discount).toBe(0);
  });

  it("no aplica cupones mientras no se conoce la hora", () => {
    expect(summarizeOrder([line(KILO, 1)], friday, coupon).discount).toBe(0);
  });

  it("descarta productos que ya no están en el catálogo", () => {
    const summary = summarizeOrder([line(-1, 3), line(KILO, 1)], friday);
    expect(summary.lines).toHaveLength(1);
    expect(summary.itemCount).toBe(1);
  });
});
