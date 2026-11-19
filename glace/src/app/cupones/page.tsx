import type { Metadata } from "next";

import { CouponsView } from "@/components/coupons-view";
import { PageHeader, PageShell } from "@/components/page-header";
import { COUPON_TIERS, COUPON_VALID_DAYS } from "@/data/coupons";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cupones de canje",
  description: "Cada pedido en Helados Glacé suma un cupón de descuento para tu próxima compra.",
};

const STEPS = [
  { title: "Hacé tu pedido", text: "Armalo acá y envialo por WhatsApp." },
  { title: "Ganá tu cupón", text: "Según el total, se guarda un cupón en tu teléfono." },
  { title: "Canjealo", text: "Elegilo en tu próximo pedido y el descuento se aplica solo." },
];

export default function CouponsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Beneficios" title="Cupones de canje">
        Cuanto más grande tu pedido, mejor el cupón que te llevás para la próxima.
      </PageHeader>

      <section aria-labelledby="escalones-titulo" className="flex flex-col gap-4">
        <h2 id="escalones-titulo" className="text-2xl font-bold text-primary">
          Qué cupón ganás
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {COUPON_TIERS.map((tier) => (
            <li key={tier.id} className="flex flex-col gap-1 rounded-3xl border bg-card p-5">
              <span className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
                Pedidos desde {formatPrice(tier.minOrder)}
              </span>
              <span className="font-heading text-3xl font-bold text-pink-deep">{formatPrice(tier.value)}</span>
              <span className="text-sm text-muted-foreground">
                de descuento en tu próximo pedido desde {formatPrice(tier.redeemMin)}.
              </span>
            </li>
          ))}
        </ul>
        <ol className="grid gap-4 rounded-3xl bg-cream p-5 sm:grid-cols-3 sm:p-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="brand-mask grid size-10 shrink-0 place-items-center bg-primary font-heading text-lg font-bold text-white">
                {index + 1}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold">{step.title}</span>
                <span className="text-sm text-muted-foreground">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Cada cupón vale {COUPON_VALID_DAYS} días, se usa una sola vez y no se combina con otro cupón. Se guardan en
          este dispositivo: usá siempre el mismo teléfono o navegador para verlos.
        </p>
      </section>

      <CouponsView />
    </PageShell>
  );
}
