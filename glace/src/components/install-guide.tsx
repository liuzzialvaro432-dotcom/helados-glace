"use client";

import { useSyncExternalStore } from "react";
import { CircleCheckIcon, DownloadIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsClient } from "@/lib/hooks";
import {
  canPromptInstall,
  detectPlatform,
  isInstalled,
  promptInstall,
  subscribeInstall,
  type Platform,
} from "@/lib/install";

const GUIDES: Record<Platform, { label: string; intro: string; steps: string[]; note?: string }> = {
  ios: {
    label: "iPhone y iPad",
    intro: "Se instala desde Safari, sin pasar por el App Store.",
    steps: [
      "Abrí esta página en Safari.",
      "Tocá el botón Compartir: el cuadrado con una flecha hacia arriba.",
      "Deslizá hacia abajo y elegí «Agregar a inicio».",
      "Tocá «Agregar». El ícono de Glacé queda en tu pantalla de inicio.",
    ],
    note: "También funciona desde Chrome o Edge en iPhone: Compartir → «Agregar a inicio».",
  },
  android: {
    label: "Android",
    intro: "Se instala desde Chrome, sin pasar por Play Store.",
    steps: [
      "Abrí esta página en Chrome.",
      "Tocá el menú de los tres puntos, arriba a la derecha.",
      "Elegí «Agregar a pantalla principal» o «Instalar app».",
      "Confirmá con «Instalar». El ícono de Glacé queda junto a tus otras apps.",
    ],
  },
  desktop: {
    label: "Computadora",
    intro: "Funciona en Windows, macOS y Linux.",
    steps: [
      "En Chrome o Edge: hacé clic en el ícono de instalar, a la derecha de la barra de direcciones.",
      "Confirmá con «Instalar». Glacé se abre en su propia ventana.",
      "En Safari (Mac): menú Archivo → «Agregar al Dock».",
    ],
    note: "En Linux se instala igual desde Chrome, Chromium o Edge.",
  },
};

const ORDER: Platform[] = ["ios", "android", "desktop"];

export function InstallGuide() {
  const isClient = useIsClient();
  const promptReady = useSyncExternalStore(subscribeInstall, canPromptInstall, () => false);

  if (!isClient) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando instrucciones">
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const platform = detectPlatform();
  const installed = isInstalled();

  const install = async () => {
    const accepted = await promptInstall();
    if (accepted) toast.success("¡Listo! Glacé ya está instalada.");
  };

  return (
    <div className="flex flex-col gap-6">
      {installed ? (
        <p className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-base font-semibold text-secondary-foreground">
          <CircleCheckIcon className="size-6 shrink-0" aria-hidden="true" />
          Ya estás usando Glacé como app instalada.
        </p>
      ) : (
        promptReady && (
          <div className="flex flex-col items-start gap-3 rounded-3xl bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-semibold">Tu navegador permite instalarla con un solo toque.</p>
            <Button size="xl" onClick={install} className="rounded-full">
              <DownloadIcon aria-hidden="true" />
              Instalar Glacé
            </Button>
          </div>
        )
      )}

      <Tabs defaultValue={platform} className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl p-1 group-data-horizontal/tabs:h-auto sm:w-fit">
          {ORDER.map((id) => (
            <TabsTrigger key={id} value={id} className="h-11 rounded-xl px-3 text-sm font-semibold sm:px-5">
              {id === "desktop" ? <MonitorIcon aria-hidden="true" /> : <SmartphoneIcon aria-hidden="true" />}
              {GUIDES[id].label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ORDER.map((id) => {
          const guide = GUIDES[id];
          return (
            <TabsContent key={id} value={id} className="rounded-3xl border bg-card p-5 sm:p-7">
              <h2 className="text-2xl font-bold text-primary">{guide.label}</h2>
              <p className="mt-1 text-base text-muted-foreground">{guide.intro}</p>
              <ol className="mt-5 flex flex-col gap-4">
                {guide.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-base">
                    <span className="brand-mask grid size-9 shrink-0 place-items-center bg-primary font-heading text-base font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
              {guide.note && <p className="mt-5 text-sm text-muted-foreground">{guide.note}</p>}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
