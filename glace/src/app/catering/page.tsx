import type { Metadata } from "next";
import Image from "next/image";
import { cn } from "cn";
import { PhoneIcon } from "lucide-react";

import { WhatsAppIcon } from "@/components/brand";
import { CateringForm } from "@/components/catering-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { ShareImageButton } from "@/components/share-image-button";
import { buttonVariants } from "@/components/ui/button";
import { BUSINESS, CONTACT } from "@/lib/config";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Catering",
  description: `Helado artesanal para cumpleaños, bodas y eventos de empresa. Consultas al ${CONTACT.catering.display}.`,
};

const OFFERS = [
  { title: "Cumpleaños y fiestas", text: "Tortas heladas, potes y postres para todos los invitados." },
  { title: "Bodas y aniversarios", text: "Una mesa de helado artesanal para cerrar la noche." },
  { title: "Empresas y colegios", text: "Helado para agasajos, lanzamientos y festejos de fin de año." },
];

export default function CateringPage() {
  const whatsapp = whatsappUrl(
    CONTACT.catering.whatsapp,
    `Hola, quiero consultar por el catering de ${BUSINESS.name}.`,
  );
  return (
    <PageShell>
      <PageHeader eyebrow="Catering Glacé" title="Helado para tu evento">
        Llevamos el helado artesanal a tu cumpleaños, boda o evento de empresa. Escribinos y armamos una propuesta a tu
        medida.
      </PageHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Image
            src="/img/catering-glace.png"
            alt={`Catering Glacé: helado para tu evento. Cumpleaños, bodas, empresas y colegios. Consultas por WhatsApp al ${CONTACT.catering.display}.`}
            width={1080}
            height={1350}
            priority
            className="h-auto w-full rounded-3xl border"
          />
          <div className="flex flex-col gap-3">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "xl" }), "rounded-full")}
            >
              <WhatsAppIcon />
              Escribir al {CONTACT.catering.display}
            </a>
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:+${CONTACT.catering.whatsapp}`}
                className={cn(buttonVariants({ variant: "outline", size: "xl" }), "rounded-full bg-card")}
              >
                <PhoneIcon aria-hidden="true" />
                Llamar
              </a>
              <ShareImageButton
                src="/img/catering-glace.png"
                fileName="catering-glace.png"
                title="Catering Glacé"
                text={`Catering ${BUSINESS.name}: consultas al ${CONTACT.catering.display}`}
              >
                Compartir imagen
              </ShareImageButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {OFFERS.map((offer) => (
              <li key={offer.title} className="flex flex-col gap-1 rounded-2xl bg-cream p-4">
                <span className="text-base font-bold text-primary">{offer.title}</span>
                <span className="text-sm text-muted-foreground">{offer.text}</span>
              </li>
            ))}
          </ul>
          <CateringForm />
        </div>
      </div>
    </PageShell>
  );
}
