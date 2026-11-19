"use client";

import { ShoppingBagIcon } from "lucide-react";

import { useCartCount } from "@/components/cart/cart-button";
import { formatPrice } from "@/lib/format";
import { useStoreTime } from "@/lib/hooks";
import { summarizeOrder } from "@/lib/pricing";
import { useCart, useUi } from "@/lib/store";

/** Acceso fijo al pedido en teléfonos, sobre la barra de navegación. */
export function CartBar() {
  const count = useCartCount();
  const lines = useCart((state) => state.lines);
  const local = useStoreTime();
  const openCart = useUi((state) => state.openCart);
  const cartOpen = useUi((state) => state.cartOpen);
  if (count === 0 || cartOpen) return null;
  const { subtotal } = summarizeOrder(lines, local);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-3 pb-2 md:hidden">
      <button
        type="button"
        onClick={openCart}
        className="pointer-events-auto mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full bg-primary px-5 text-primary-foreground shadow-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-px"
      >
        <span className="relative">
          <ShoppingBagIcon className="size-6" aria-hidden="true" />
          <span className="absolute -top-2 -right-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-primary">
            {count}
          </span>
        </span>
        <span className="ml-1 text-base font-bold">Ver mi pedido</span>
        <span className="ml-auto text-base font-bold tabular-nums">{formatPrice(subtotal)}</span>
      </button>
    </div>
  );
}
