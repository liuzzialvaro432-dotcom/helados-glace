"use client";

import { WhatsAppIcon } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { PROMOTIONS } from "@/data/promotions";
import { BUSINESS } from "@/lib/config";
import { shareUrl } from "@/lib/whatsapp";

function open(text: string) {
  const opened = window.open(shareUrl(text), "_blank");
  if (opened) opened.opener = null;
}

/** Envío del catálogo y de las promos por WhatsApp, con el enlace de esta misma web. */
export function ShareCatalog() {
  const shareMenu = () =>
    open(
      [
        `🍦 *${BUSINESS.name}*`,
        "Mirá el menú completo y hacé tu pedido en un minuto:",
        `${window.location.origin}/`,
      ].join("\n"),
    );

  const sharePromos = () =>
    open(
      [
        `🎉 *Promociones de ${BUSINESS.name}*`,
        ...PROMOTIONS.map((promotion) => `• *${promotion.title}*: ${promotion.description}`),
        "",
        `Pedí acá: ${window.location.origin}/promociones`,
      ].join("\n"),
    );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button size="xl" onClick={sharePromos} className="rounded-full">
        <WhatsAppIcon />
        Enviar las promos
      </Button>
      <Button size="xl" variant="outline" onClick={shareMenu} className="rounded-full bg-card">
        <WhatsAppIcon />
        Enviar el catálogo
      </Button>
    </div>
  );
}
