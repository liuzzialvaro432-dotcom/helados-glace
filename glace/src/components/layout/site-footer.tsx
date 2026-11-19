import Link from "next/link";

import { AnniversaryTag, LogoBadge, TextureBand, WhatsAppIcon } from "@/components/brand";
import { BUSINESS, CONTACT, NAV_LINKS } from "@/lib/config";
import { weeklyHoursSummary } from "@/lib/hours";
import { whatsappUrl } from "@/lib/whatsapp";

const linkClass =
  "rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50";

export function SiteFooter() {
  const hours = weeklyHoursSummary();
  return (
    <footer className="mt-16 bg-cream">
      <TextureBand />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <LogoBadge size={72} />
            <AnniversaryTag />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            {BUSINESS.tagline}. Gracias por acompañarnos estos {BUSINESS.anniversaryYears} años.
          </p>
        </div>

        <nav aria-label="Secciones" className="flex flex-col gap-2 text-sm">
          <h2 className="font-sans text-xs font-bold tracking-[0.18em] text-primary uppercase">Secciones</h2>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`${linkClass} w-fit`}>
              {link.label}
            </Link>
          ))}
          <Link href="/instalar" className={`${linkClass} w-fit`}>
            Instalar la app
          </Link>
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="font-sans text-xs font-bold tracking-[0.18em] text-primary uppercase">Horario de pedidos</h2>
          <dl className="flex flex-col gap-1.5">
            {hours.map((row) => (
              <div key={row.days} className="flex flex-col">
                <dt className="font-medium">{row.days}</dt>
                <dd className="text-muted-foreground">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <h2 className="font-sans text-xs font-bold tracking-[0.18em] text-primary uppercase">Contacto</h2>
          <a
            href={whatsappUrl(CONTACT.orders.whatsapp, "Hola Helados Glacé 👋, tengo una consulta.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} flex w-fit items-center gap-2`}
          >
            <WhatsAppIcon className="size-4 text-primary" />
            Pedidos: {CONTACT.orders.display}
          </a>
          <a
            href={whatsappUrl(CONTACT.catering.whatsapp, "Hola, quiero consultar por el catering de Helados Glacé.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} flex w-fit items-center gap-2`}
          >
            <WhatsAppIcon className="size-4 text-primary" />
            Catering: {CONTACT.catering.display}
          </a>
          <p className="text-muted-foreground">{BUSINESS.deliveryFeeNote}.</p>
        </div>
      </div>
      <div className="border-t px-4 py-4 pb-24 text-center text-xs text-muted-foreground md:pb-4">
        {BUSINESS.name} · Helados artesanales · Paraguay
      </div>
    </footer>
  );
}
