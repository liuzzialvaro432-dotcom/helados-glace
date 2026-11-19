import type { Metadata } from "next";

import { MonthCalendar } from "@/components/month-calendar";
import { PageHeader, PageShell } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Calendario",
  description: "Partidos de Paraguay, fechas patrias, días especiales y promos de Helados Glacé, mes a mes.",
};

export default function CalendarPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Mes a mes" title="Calendario Glacé">
        Los partidos de la Albirroja, el Día del Niño, el Día de la Bandera y todas las fechas para festejar con helado.
      </PageHeader>
      <MonthCalendar />
    </PageShell>
  );
}
