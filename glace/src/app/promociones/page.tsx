import type { Metadata } from "next";

import { PageHeader, PageShell } from "@/components/page-header";
import { ProductRow } from "@/components/product/product-card";
import { PromoCard } from "@/components/promo-card";
import { ShareCatalog } from "@/components/share-catalog";
import { FEATURED_PRODUCTS } from "@/data/catalog";
import { PROMOTIONS } from "@/data/promotions";

export const metadata: Metadata = {
  title: "Promociones",
  description: "Jueves de Glacé, cupones de canje y los productos más pedidos de Helados Glacé.",
};

export default function PromotionsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Esta semana" title="Promociones">
        Las promos vigentes y los productos que más salen. Tocá una para sumarla a tu pedido.
      </PageHeader>

      <section aria-label="Promociones vigentes" className="grid gap-4 md:grid-cols-2">
        {PROMOTIONS.map((promotion) => (
          <PromoCard key={promotion.id} promotion={promotion} detailed className="min-h-56" />
        ))}
      </section>

      <section aria-labelledby="compartir-titulo" className="flex flex-col gap-4 rounded-3xl bg-cream p-6 sm:p-8">
        <div className="flex max-w-2xl flex-col gap-1">
          <h2 id="compartir-titulo" className="text-2xl font-bold text-primary">
            Compartí Glacé por WhatsApp
          </h2>
          <p className="text-base text-muted-foreground">
            Enviá las promos o el catálogo completo a un contacto o a un grupo. Quien lo recibe abre el enlace y arma su
            pedido.
          </p>
        </div>
        <ShareCatalog />
      </section>

      <section aria-labelledby="destacados-titulo" className="flex flex-col gap-4">
        <h2 id="destacados-titulo" className="text-2xl font-bold text-primary">
          Productos destacados
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
