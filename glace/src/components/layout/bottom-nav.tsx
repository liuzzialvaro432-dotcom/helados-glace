"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  DownloadIcon,
  HomeIcon,
  MapPinIcon,
  MenuIcon,
  PartyPopperIcon,
  TagIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react";

import { WhatsAppIcon } from "@/components/brand";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CONTACT } from "@/lib/config";
import { whatsappUrl } from "@/lib/whatsapp";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Pedir", icon: HomeIcon },
  { href: "/promociones", label: "Promos", icon: TagIcon },
  { href: "/cupones", label: "Cupones", icon: TicketIcon },
  { href: "/calendario", label: "Calendario", icon: CalendarDaysIcon },
];

const MORE_LINKS: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/catering", label: "Catering", hint: "Helado para tu evento", icon: PartyPopperIcon },
  { href: "/sucursales", label: "Sucursales", hint: "Direcciones y teléfonos", icon: MapPinIcon },
  { href: "/instalar", label: "Instalar la app", hint: "iPhone, Android y computadora", icon: DownloadIcon },
];

const itemClass =
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[0.6875rem] font-semibold text-muted-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50";

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_LINKS.some((link) => pathname.startsWith(link.href));

  return (
    <>
      <nav
        aria-label="Navegación"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch gap-1 px-2 py-1.5">
          {TABS.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(itemClass, active && "bg-secondary text-secondary-foreground")}
              >
                <tab.icon className="size-5" aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={cn(itemClass, moreActive && "bg-secondary text-secondary-foreground")}
          >
            <MenuIcon className="size-5" aria-hidden="true" />
            Más
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="pb-safe rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl font-bold">Más de Glacé</SheetTitle>
            <SheetDescription>Catering, sucursales y la app en tu teléfono.</SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col gap-1 px-2 pb-4">
            {MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-3 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <link.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-base font-semibold">{link.label}</span>
                    <span className="text-sm text-muted-foreground">{link.hint}</span>
                  </span>
                  <ChevronRightIcon className="size-5 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li>
              <a
                href={whatsappUrl(CONTACT.orders.whatsapp, "Hola Helados Glacé 👋, tengo una consulta.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl p-3 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                  <WhatsAppIcon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base font-semibold">Consultas por WhatsApp</span>
                  <span className="text-sm text-muted-foreground">{CONTACT.orders.display}</span>
                </span>
                <ChevronRightIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
