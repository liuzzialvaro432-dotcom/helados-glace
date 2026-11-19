/**
 * Cupones de canje según el monto de compra.
 * Un pedido con total ≥ `minOrder` gana un cupón de `value`, que se canjea
 * en un pedido posterior con subtotal ≥ `redeemMin`.
 * Los montos son una propuesta inicial: ajustalos acá.
 */
export type CouponTier = {
  id: string;
  name: string;
  minOrder: number;
  value: number;
  redeemMin: number;
};

export const COUPON_TIERS: CouponTier[] = [
  { id: "vainilla", name: "Vainilla", minOrder: 60000, value: 5000, redeemMin: 40000 },
  { id: "dulce-de-leche", name: "Dulce de leche", minOrder: 100000, value: 10000, redeemMin: 60000 },
  { id: "chocolate", name: "Chocolate", minOrder: 150000, value: 20000, redeemMin: 100000 },
];

export const COUPON_VALID_DAYS = 30;
