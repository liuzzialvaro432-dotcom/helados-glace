import { describe, expect, it } from "vitest";

import { COUPON_TIERS, COUPON_VALID_DAYS } from "@/data/coupons";
import {
  checkCoupon,
  createCoupon,
  daysLeft,
  generateCouponCode,
  isCouponActive,
  nextTier,
  tierForOrder,
} from "@/lib/coupons";

const tiers = [
  { id: "a", name: "A", minOrder: 60000, value: 5000, redeemMin: 40000 },
  { id: "b", name: "B", minOrder: 100000, value: 10000, redeemMin: 60000 },
];
const now = new Date("2026-11-19T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

describe("escalones de cupones", () => {
  it("no da cupón por debajo del primer escalón", () => {
    expect(tierForOrder(59999, tiers)).toBeNull();
  });

  it("da el mejor escalón alcanzado", () => {
    expect(tierForOrder(60000, tiers)?.id).toBe("a");
    expect(tierForOrder(250000, tiers)?.id).toBe("b");
  });

  it("indica el siguiente escalón", () => {
    expect(nextTier(0, tiers)?.id).toBe("a");
    expect(nextTier(60000, tiers)?.id).toBe("b");
    expect(nextTier(100000, tiers)).toBeNull();
  });

  it("los escalones configurados crecen en monto y en premio, y el premio nunca supera el mínimo de canje", () => {
    for (let i = 0; i < COUPON_TIERS.length; i += 1) {
      const tier = COUPON_TIERS[i];
      expect(tier.value).toBeLessThan(tier.redeemMin);
      if (i > 0) {
        expect(tier.minOrder).toBeGreaterThan(COUPON_TIERS[i - 1].minOrder);
        expect(tier.value).toBeGreaterThan(COUPON_TIERS[i - 1].value);
      }
    }
  });
});

describe("generateCouponCode", () => {
  it("usa el formato GLACE-XXXXXX sin caracteres ambiguos", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateCouponCode()).toMatch(/^GLACE-[2-9A-HJ-NP-Z]{6}$/);
    }
  });

  it("es determinista con la fuente de azar que recibe", () => {
    expect(generateCouponCode(() => 0)).toBe("GLACE-222222");
    expect(generateCouponCode(() => 0.999999)).toBe("GLACE-ZZZZZZ");
  });
});

describe("validez del cupón", () => {
  const coupon = createCoupon(tiers[0], now, "GLACE-ABCDEF");

  it("vence a los días configurados", () => {
    expect(new Date(coupon.expiresAt).getTime() - now.getTime()).toBe(COUPON_VALID_DAYS * DAY);
    expect(daysLeft(coupon, now)).toBe(COUPON_VALID_DAYS);
  });

  it("se puede canjear con el subtotal mínimo", () => {
    expect(checkCoupon(coupon, 40000, now)).toEqual({ ok: true });
    expect(checkCoupon(coupon, 39999, now)).toEqual({ ok: false, reason: "minimum" });
  });

  it("no se puede canjear vencido ni usado", () => {
    const expired = new Date(now.getTime() + (COUPON_VALID_DAYS + 1) * DAY);
    expect(checkCoupon(coupon, 90000, expired)).toEqual({ ok: false, reason: "expired" });
    expect(isCouponActive(coupon, expired)).toBe(false);
    const used = { ...coupon, usedAt: now.toISOString() };
    expect(checkCoupon(used, 90000, now)).toEqual({ ok: false, reason: "used" });
    expect(isCouponActive(used, now)).toBe(false);
  });
});
