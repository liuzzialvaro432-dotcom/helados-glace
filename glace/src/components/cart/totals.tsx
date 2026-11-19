import { formatPrice } from "@/lib/format";
import type { OrderSummary } from "@/lib/pricing";

export function Totals({ summary, pickup }: { summary: OrderSummary; pickup?: boolean }) {
  return (
    <dl className="flex flex-col gap-1.5 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Productos</dt>
        <dd className="font-medium tabular-nums">{formatPrice(summary.subtotal)}</dd>
      </div>
      {summary.coupon && summary.discount > 0 && (
        <div className="flex justify-between gap-4 text-primary">
          <dt>Cupón {summary.coupon.code}</dt>
          <dd className="font-medium tabular-nums">−{formatPrice(summary.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">{pickup ? "Retiro en el local" : "Envío"}</dt>
        <dd className="font-medium">{pickup ? "Sin costo" : "A confirmar"}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-1 text-base">
        <dt className="font-bold">Total</dt>
        <dd className="text-xl font-bold tabular-nums">{formatPrice(summary.total)}</dd>
      </div>
    </dl>
  );
}
