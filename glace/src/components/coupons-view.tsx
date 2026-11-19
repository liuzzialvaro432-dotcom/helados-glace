"use client";

import Link from "next/link";
import { cn } from "cn";
import { RotateCcwIcon, TicketIcon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProduct } from "@/data/catalog";
import { daysLeft, isCouponActive, type Coupon } from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { useCart, useRewards, useUi, type OrderRecord } from "@/lib/store";
import { storeTime, MONTH_NAMES } from "@/lib/time";

function formatDay(iso: string): string {
  const local = storeTime(new Date(iso));
  return `${local.day} de ${MONTH_NAMES[local.month - 1].toLowerCase()}`;
}

function ActiveCoupon({ coupon, now }: { coupon: Coupon; now: Date }) {
  const selectCoupon = useCart((state) => state.selectCoupon);
  const hasItems = useCart((state) => state.lines.length > 0);
  const openCart = useUi((state) => state.openCart);
  const days = daysLeft(coupon, now);

  const use = () => {
    selectCoupon(coupon.code);
    if (hasItems) openCart();
    else toast.success("Cupón elegido. Se aplica cuando armes tu pedido.");
  };

  return (
    <li className="flex overflow-hidden rounded-3xl border bg-card">
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 bg-pink-deep p-3 text-center text-white">
        <span className="text-[0.6875rem] font-bold tracking-widest uppercase">Cupón</span>
        <span className="font-heading text-2xl leading-none font-bold">{formatPrice(coupon.value)}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 border-l-2 border-dashed p-4">
        <p className="font-mono text-lg font-bold tracking-wider">{coupon.code}</p>
        <p className="text-sm text-muted-foreground">
          En pedidos desde {formatPrice(coupon.redeemMin)} ·{" "}
          {days <= 1 ? "vence hoy" : `vence en ${days} días (${formatDay(coupon.expiresAt)})`}
        </p>
        <Button size="lg" onClick={use} className="mt-1 h-11 w-fit rounded-full px-5">
          Usar en mi pedido
        </Button>
      </div>
    </li>
  );
}

function PastOrder({ order }: { order: OrderRecord }) {
  const replaceLines = useCart((state) => state.replaceLines);
  const openCart = useUi((state) => state.openCart);
  const available = order.lines.filter((line) => getProduct(line.productId));
  const names = available.map((line) => `${line.quantity}× ${getProduct(line.productId)?.name}`);

  const repeat = () => {
    replaceLines(available);
    openCart();
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-bold">
          {formatDay(order.placedAt)} · {formatPrice(order.total)}
        </p>
        <p className="text-sm text-muted-foreground">{names.join(", ") || "Productos que ya no están en el menú"}</p>
      </div>
      {available.length > 0 && (
        <Button variant="outline" size="lg" onClick={repeat} className="h-11 w-fit rounded-full px-5">
          <RotateCcwIcon aria-hidden="true" />
          Repetir pedido
        </Button>
      )}
    </li>
  );
}

export function CouponsView() {
  const hydrated = useUi((state) => state.hydrated);
  const now = useNow();
  const coupons = useRewards((state) => state.coupons);
  const orders = useRewards((state) => state.orders);

  if (!hydrated || !now) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando tus cupones">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
      </div>
    );
  }

  const active = coupons.filter((coupon) => isCouponActive(coupon, now));
  const past = coupons.filter((coupon) => !isCouponActive(coupon, now));

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="mis-cupones-titulo" className="flex flex-col gap-4">
        <h2 id="mis-cupones-titulo" className="text-2xl font-bold text-primary">
          Mis cupones
        </h2>
        {active.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {active.map((coupon) => (
              <ActiveCoupon key={coupon.code} coupon={coupon} now={now} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card px-6 py-10 text-center">
            <TicketIcon className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-semibold">Todavía no tenés cupones</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Hacé tu primer pedido y, según el monto, te llevás un cupón de descuento para el siguiente.
            </p>
            <Link href="/#menu" className={cn(buttonVariants({ size: "xl" }), "mt-1 rounded-full")}>
              Ver el menú
            </Link>
          </div>
        )}
        {past.length > 0 && (
          <details className="rounded-2xl border bg-card p-4 text-sm">
            <summary className="cursor-pointer font-semibold">Cupones usados o vencidos ({past.length})</summary>
            <ul className="mt-3 flex flex-col gap-2 text-muted-foreground">
              {past.map((coupon) => (
                <li key={coupon.code} className="flex flex-wrap justify-between gap-2">
                  <span className="font-mono">{coupon.code}</span>
                  <span>
                    {formatPrice(coupon.value)} · {coupon.usedAt ? `usado el ${formatDay(coupon.usedAt)}` : "vencido"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {orders.length > 0 && (
        <section aria-labelledby="pedidos-titulo" className="flex flex-col gap-4">
          <h2 id="pedidos-titulo" className="text-2xl font-bold text-primary">
            Tus últimos pedidos
          </h2>
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <PastOrder key={order.id} order={order} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
