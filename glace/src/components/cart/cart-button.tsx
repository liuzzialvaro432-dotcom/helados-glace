"use client";

import { ShoppingBagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart, useUi } from "@/lib/store";

export function useCartCount(): number {
  const hydrated = useUi((state) => state.hydrated);
  const count = useCart((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));
  return hydrated ? count : 0;
}

export function CartButton() {
  const count = useCartCount();
  const openCart = useUi((state) => state.openCart);
  return (
    <Button
      variant="outline"
      size="xl"
      onClick={openCart}
      aria-label={count > 0 ? `Ver mi pedido, ${count} ${count === 1 ? "producto" : "productos"}` : "Ver mi pedido"}
      className="relative h-11 rounded-full px-4"
    >
      <ShoppingBagIcon />
      <span className="hidden text-sm font-semibold sm:inline">Mi pedido</span>
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  );
}
