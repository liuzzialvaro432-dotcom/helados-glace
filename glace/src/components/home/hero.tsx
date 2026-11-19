import Link from "next/link";
import { BikeIcon, ClockIcon, CreditCardIcon } from "lucide-react";
import { cn } from "cn";

import { AnniversarySeal, LogoBadge, WhatsAppIcon } from "@/components/brand";
import { StoreStatusChip } from "@/components/store-status";
import { buttonVariants } from "@/components/ui/button";
import { BUSINESS } from "@/lib/config";

export function Hero() {
  const years = BUSINESS.anniversaryYears;
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-marron text-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- fondo decorativo servido tal cual, ya optimizado en WebP */}
      <img
        src="/img/hero.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:py-16">
        <div className="flex max-w-xl flex-col items-start gap-4">
          <StoreStatusChip tone="dark" />
          <p className="text-xs font-bold tracking-[0.2em] uppercase">Helados artesanales · Desde {BUSINESS.foundedYear}</p>
          <h1 id="hero-titulo" className="headline text-4xl text-balance sm:text-5xl lg:text-6xl">
            Siempre hay espacio para el helado
          </h1>
          <p className="max-w-md text-base font-medium text-pretty sm:text-lg">
            Elegí tus sabores, armá tu pedido y envialo por WhatsApp. Te lo llevamos a tu casa o lo retirás en tu
            sucursal.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a href="#menu" className={cn(buttonVariants({ size: "xl" }), "rounded-full bg-pink-deep px-7 hover:bg-pink-deep/90")}>
              Pedir ahora
            </a>
            <Link
              href="/promociones"
              className={cn(
                buttonVariants({ variant: "outline", size: "xl" }),
                "rounded-full border-white bg-transparent px-6 text-white hover:bg-white hover:text-foreground",
              )}
            >
              Ver promociones
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-5">
          <LogoBadge size={208} priority className="size-24 sm:size-28 md:size-52" />
          <div className="flex items-center gap-3">
            <AnniversarySeal className="size-16 md:size-20" />
            <p className="max-w-[11rem] font-heading text-lg leading-tight font-bold text-balance md:text-xl">
              {years} años endulzando al Paraguay. ¡Gracias!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FACTS = [
  { icon: BikeIcon, title: "Delivery o retiro", text: "Elegís la sucursal que te queda más cerca." },
  { icon: WhatsAppIcon, title: "Pedido por WhatsApp", text: "Lo armás acá y lo enviás en un mensaje." },
  { icon: CreditCardIcon, title: "Pagás como quieras", text: "Efectivo, tarjeta o transferencia." },
  { icon: ClockIcon, title: "Todos los días", text: "Desde las 10:00, hasta las 21:00 o 22:00." },
];

export function InfoStrip() {
  return (
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-4 lg:grid-cols-4">
      {FACTS.map((fact) => (
        <li key={fact.title} className="flex items-start gap-3">
          <span className="brand-mask grid size-11 shrink-0 place-items-center bg-primary text-white">
            <fact.icon className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-bold">{fact.title}</span>
            <span className="text-sm text-muted-foreground">{fact.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
