import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PaymentMethodId } from "@/lib/config";
import { createCoupon, generateCouponCode, tierForOrder, type Coupon } from "@/lib/coupons";
import { lineKey, type CartLine, type Selections } from "@/lib/pricing";
import type { DeliveryMode } from "@/lib/whatsapp";

const MAX_QUANTITY = 20;
const MAX_ORDER_HISTORY = 10;

type CartState = {
  lines: CartLine[];
  orderNote: string;
  couponCode: string | null;
  add: (productId: number, selections: Selections, note: string, quantity: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  setOrderNote: (note: string) => void;
  selectCoupon: (code: string | null) => void;
  replaceLines: (lines: CartLine[]) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      orderNote: "",
      couponCode: null,
      add: (productId, selections, note, quantity) =>
        set((state) => {
          const key = lineKey(productId, selections, note);
          const existing = state.lines.find((line) => line.key === key);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.key === key
                  ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
                  : line,
              ),
            };
          }
          const line: CartLine = { key, productId, selections, note: note.trim(), quantity };
          return { lines: [...state.lines, line] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.key !== key)
              : state.lines.map((line) =>
                  line.key === key ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line,
                ),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((line) => line.key !== key) })),
      setOrderNote: (orderNote) => set({ orderNote }),
      selectCoupon: (couponCode) => set({ couponCode }),
      replaceLines: (lines) => set({ lines }),
      clear: () => set({ lines: [], orderNote: "", couponCode: null }),
    }),
    { name: "glace-cart", version: 1, skipHydration: true },
  ),
);

export type CustomerState = {
  mode: DeliveryMode;
  branchId: number | null;
  name: string;
  phone: string;
  address: string;
  reference: string;
  payment: PaymentMethodId;
  cashAmount: string;
  receipt: "ticket" | "factura";
  invoiceName: string;
  invoiceRuc: string;
  update: (patch: Partial<Omit<CustomerState, "update">>) => void;
};

export const useCustomer = create<CustomerState>()(
  persist(
    (set) => ({
      mode: "delivery",
      branchId: null,
      name: "",
      phone: "",
      address: "",
      reference: "",
      payment: "efectivo",
      cashAmount: "",
      receipt: "ticket",
      invoiceName: "",
      invoiceRuc: "",
      update: (patch) => set(patch),
    }),
    { name: "glace-customer", version: 1, skipHydration: true },
  ),
);

export type OrderRecord = {
  id: string;
  placedAt: string;
  total: number;
  itemCount: number;
  lines: CartLine[];
};

type RewardsState = {
  coupons: Coupon[];
  orders: OrderRecord[];
  /** Registra el pedido enviado, consume el cupón usado y devuelve el cupón ganado (si corresponde). */
  recordOrder: (order: {
    total: number;
    itemCount: number;
    lines: CartLine[];
    usedCouponCode: string | null;
  }) => Coupon | null;
};

function secureRandom(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / 2 ** 32;
}

export const useRewards = create<RewardsState>()(
  persist(
    (set, get) => ({
      coupons: [],
      orders: [],
      recordOrder: ({ total, itemCount, lines, usedCouponCode }) => {
        const now = new Date();
        const existing = new Set(get().coupons.map((coupon) => coupon.code));
        const tier = tierForOrder(total);
        let earned: Coupon | null = null;
        if (tier) {
          let code = generateCouponCode(secureRandom);
          while (existing.has(code)) code = generateCouponCode(secureRandom);
          earned = createCoupon(tier, now, code);
        }
        const record: OrderRecord = {
          id: `${now.getTime()}`,
          placedAt: now.toISOString(),
          total,
          itemCount,
          lines,
        };
        set((state) => ({
          coupons: [
            ...(earned ? [earned] : []),
            ...state.coupons.map((coupon) =>
              coupon.code === usedCouponCode ? { ...coupon, usedAt: now.toISOString() } : coupon,
            ),
          ],
          orders: [record, ...state.orders].slice(0, MAX_ORDER_HISTORY),
        }));
        return earned;
      },
    }),
    { name: "glace-rewards", version: 1, skipHydration: true },
  ),
);

type UiState = {
  hydrated: boolean;
  cartOpen: boolean;
  productId: number | null;
  setHydrated: () => void;
  openCart: () => void;
  setCartOpen: (open: boolean) => void;
  openProduct: (id: number) => void;
  closeProduct: () => void;
};

export const useUi = create<UiState>()((set) => ({
  hydrated: false,
  cartOpen: false,
  productId: null,
  setHydrated: () => set({ hydrated: true }),
  openCart: () => set({ cartOpen: true }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  openProduct: (productId) => set({ productId }),
  closeProduct: () => set({ productId: null }),
}));

export async function hydrateStores(): Promise<void> {
  await Promise.all([
    useCart.persist.rehydrate(),
    useCustomer.persist.rehydrate(),
    useRewards.persist.rehydrate(),
  ]);
  useUi.getState().setHydrated();
}
