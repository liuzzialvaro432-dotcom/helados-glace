import { COUPON_TIERS, COUPON_VALID_DAYS, type CouponTier } from "@/data/coupons";

export type Coupon = {
  code: string;
  tierId: string;
  value: number;
  redeemMin: number;
  earnedAt: string;
  expiresAt: string;
  usedAt: string | null;
};

export type CouponCheck = { ok: true } | { ok: false; reason: "used" | "expired" | "minimum" };

const DAY_MS = 24 * 60 * 60 * 1000;
// Sin 0/O ni 1/I para que el código se pueda dictar sin errores.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Mejor cupón que gana un pedido de ese total, o null si no llega al primer escalón. */
export function tierForOrder(total: number, tiers: CouponTier[] = COUPON_TIERS): CouponTier | null {
  let best: CouponTier | null = null;
  for (const tier of tiers) {
    if (total >= tier.minOrder && (!best || tier.minOrder > best.minOrder)) best = tier;
  }
  return best;
}

/** Siguiente escalón que todavía no alcanza ese total. */
export function nextTier(total: number, tiers: CouponTier[] = COUPON_TIERS): CouponTier | null {
  let next: CouponTier | null = null;
  for (const tier of tiers) {
    if (total < tier.minOrder && (!next || tier.minOrder < next.minOrder)) next = tier;
  }
  return next;
}

export function generateCouponCode(random: () => number = Math.random): string {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return `GLACE-${suffix}`;
}

export function createCoupon(tier: CouponTier, now: Date, code: string): Coupon {
  return {
    code,
    tierId: tier.id,
    value: tier.value,
    redeemMin: tier.redeemMin,
    earnedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + COUPON_VALID_DAYS * DAY_MS).toISOString(),
    usedAt: null,
  };
}

export function checkCoupon(coupon: Coupon, subtotal: number, now: Date): CouponCheck {
  if (coupon.usedAt) return { ok: false, reason: "used" };
  if (now.getTime() > new Date(coupon.expiresAt).getTime()) return { ok: false, reason: "expired" };
  if (subtotal < coupon.redeemMin) return { ok: false, reason: "minimum" };
  return { ok: true };
}

export function isCouponActive(coupon: Coupon, now: Date): boolean {
  return !coupon.usedAt && now.getTime() <= new Date(coupon.expiresAt).getTime();
}

export function daysLeft(coupon: Coupon, now: Date): number {
  return Math.max(0, Math.ceil((new Date(coupon.expiresAt).getTime() - now.getTime()) / DAY_MS));
}
