import Link from "next/link";

import { Eyebrow } from "@/components/brand";
import { PromoCard } from "@/components/promo-card";
import { PROMOTIONS } from "@/data/promotions";

export function PromoStrip() {
  return (
    <section aria-labelledby="promos-titulo" className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Eyebrow>Esta semana</Eyebrow>
          <h2 id="promos-titulo" className="text-3xl font-bold text-pink">
            Promociones
          </h2>
        </div>
        <Link
          href="/promociones"
          className="rounded-full px-2 py-2 text-sm font-bold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Ver todas
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {PROMOTIONS.map((promotion) => (
          <PromoCard
            key={promotion.id}
            promotion={promotion}
            className="min-h-52 w-[85%] shrink-0 snap-start sm:w-[26rem]"
          />
        ))}
      </div>
    </section>
  );
}
