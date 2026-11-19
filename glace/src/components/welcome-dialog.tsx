"use client";

import { useEffect, useState } from "react";

import { AnniversarySeal, TexturePanel } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BUSINESS } from "@/lib/config";

const SEEN_KEY = "glace-bienvenida";

/** Agradecimiento por el aniversario, una vez por visita. */
export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const deepLinked = new URLSearchParams(window.location.search).has("producto");
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen || deepLinked) return;
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // En modo privado puede no haber almacenamiento; el saludo vuelve a aparecer y no pasa nada.
      }
    }
  };

  const years = BUSINESS.anniversaryYears;
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-md">
        <TexturePanel variant="waves" className="h-24" />
        <div className="flex flex-col items-center gap-4 px-6 pt-0 pb-6 text-center">
          <AnniversarySeal className="-mt-12 size-28" />
          <DialogTitle className="font-heading text-3xl leading-tight font-bold text-pink">
            ¡Gracias por {years} años juntos!
          </DialogTitle>
          <DialogDescription className="text-base text-pretty text-foreground">
            Desde {BUSINESS.foundedYear} compartimos helado artesanal en cada cumpleaños, cada sobremesa y cada antojo.
            Estos {years} años son gracias a vos.
          </DialogDescription>
          <Button size="xl" onClick={() => close(false)} className="w-full rounded-full">
            Empezar mi pedido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
