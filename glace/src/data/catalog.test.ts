import { describe, expect, it } from "vitest";

import { BRANCHES, ORDER_BRANCH_OPTIONS } from "@/data/branches";
import { CATEGORIES, FEATURED_PRODUCTS, PRODUCTS, WEEKLY_HOURS, getProduct, matchesSearch } from "@/data/catalog";
import { PRICE_PROMOS, PROMOTIONS } from "@/data/promotions";
import { formatPrice, parseAmount } from "@/lib/format";

describe("catálogo", () => {
  it("cada categoría referencia productos que existen", () => {
    for (const category of CATEGORIES) {
      expect(category.productIds.length).toBeGreaterThan(0);
      for (const id of category.productIds) expect(getProduct(id), `producto ${id}`).toBeDefined();
    }
  });

  it("los productos tienen precio y opciones coherentes", () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
    for (const product of PRODUCTS) {
      expect(product.price, product.name).toBeGreaterThan(0);
      for (const group of product.optionGroups) {
        expect(group.items.length, product.name).toBeGreaterThan(0);
        if (group.max !== null) expect(group.max).toBeGreaterThan(0);
      }
    }
  });

  it("tiene destacados y horario para los siete días", () => {
    expect(FEATURED_PRODUCTS.length).toBeGreaterThan(0);
    expect(WEEKLY_HOURS).toHaveLength(7);
  });

  it("busca sin distinguir mayúsculas ni acentos", () => {
    const kilo = getProduct(52298)!;
    expect(matchesSearch(kilo, "HELADOS")).toBe(true);
    expect(matchesSearch(kilo, "zzz")).toBe(false);
  });
});

describe("promociones y sucursales", () => {
  it("las promos apuntan a productos del catálogo y bajan el precio", () => {
    for (const promo of PRICE_PROMOS) {
      const product = getProduct(promo.productId);
      expect(product).toBeDefined();
      expect(promo.price).toBeLessThan(product!.price);
    }
    for (const promotion of PROMOTIONS) {
      if ("productId" in promotion.action) expect(getProduct(promotion.action.productId)).toBeDefined();
    }
  });

  it("cada sucursal con pedidos online tiene dirección", () => {
    expect(ORDER_BRANCH_OPTIONS.length).toBeGreaterThan(0);
    for (const option of ORDER_BRANCH_OPTIONS) expect(option.address, option.name).not.toBe("");
    expect(new Set(BRANCHES.map((branch) => branch.id)).size).toBe(BRANCHES.length);
  });
});

describe("formato de montos", () => {
  it("formatea guaraníes con separador de miles", () => {
    expect(formatPrice(69000)).toBe("Gs. 69.000");
    expect(formatPrice(1250000)).toBe("Gs. 1.250.000");
    expect(formatPrice(500)).toBe("Gs. 500");
  });

  it("interpreta montos escritos a mano", () => {
    expect(parseAmount("100.000")).toBe(100000);
    expect(parseAmount("Gs 50000")).toBe(50000);
    expect(parseAmount("abc")).toBeNull();
  });
});
