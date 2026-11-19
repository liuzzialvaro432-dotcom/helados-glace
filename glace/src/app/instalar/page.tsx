import type { Metadata } from "next";

import { InstallGuide } from "@/components/install-guide";
import { PageHeader, PageShell } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Instalar la app",
  description: "Instalá Helados Glacé en iPhone, Android, Windows, macOS o Linux en menos de un minuto.",
};

const BENEFITS = [
  { title: "En todos tus dispositivos", text: "iPhone, iPad, Android, Windows, macOS y Linux." },
  { title: "Sin tiendas ni descargas pesadas", text: "Se instala desde el navegador y casi no ocupa espacio." },
  { title: "Siempre al día", text: "El menú y las promos se actualizan solos cada vez que la abrís." },
];

export default function InstallPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="App Glacé" title="Instalá la app">
        Tené Glacé a un toque, con tu pedido y tus cupones guardados.
      </PageHeader>
      <ul className="grid gap-3 sm:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit.title} className="flex flex-col gap-1 rounded-2xl bg-cream p-4">
            <span className="text-base font-bold text-primary">{benefit.title}</span>
            <span className="text-sm text-muted-foreground">{benefit.text}</span>
          </li>
        ))}
      </ul>
      <InstallGuide />
    </PageShell>
  );
}
