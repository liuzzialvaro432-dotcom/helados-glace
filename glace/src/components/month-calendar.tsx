"use client";

import { useState } from "react";
import { cn } from "cn";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT_KIND_LABELS, type CalendarEvent, type EventKind } from "@/data/events";
import { monthDays, shiftMonth } from "@/lib/calendar";
import { useStoreTime } from "@/lib/hooks";
import { MONTH_NAMES, WEEKDAY_NAMES } from "@/lib/time";

/** Rojo y azul de la bandera para partidos y fechas patrias; el resto, colores de la marca. */
const KIND_STYLES: Record<EventKind, { chip: string; dot: string }> = {
  partido: { chip: "bg-[#c8102e] text-white", dot: "bg-[#c8102e]" },
  patria: { chip: "bg-[#0038a8] text-white", dot: "bg-[#0038a8]" },
  especial: { chip: "bg-pink-deep text-white", dot: "bg-pink-deep" },
  feriado: { chip: "bg-marron text-white", dot: "bg-marron" },
  promo: { chip: "bg-primary text-white", dot: "bg-primary" },
};

const KIND_ORDER: EventKind[] = ["partido", "patria", "especial", "feriado", "promo"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Referencias de colores">
      {KIND_ORDER.map((kind) => (
        <li key={kind} className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true" className={cn("size-3.5 rounded-full", KIND_STYLES[kind].dot)} />
          {EVENT_KIND_LABELS[kind]}
        </li>
      ))}
    </ul>
  );
}

function EventItem({ event, day, weekday }: { event: CalendarEvent; day?: number; weekday?: number }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border bg-card p-3">
      {day !== undefined && weekday !== undefined && (
        <span className={cn("flex w-14 shrink-0 flex-col items-center rounded-xl py-1.5", KIND_STYLES[event.kind].chip)}>
          <span className="text-[0.6875rem] font-bold tracking-wider uppercase">
            {WEEKDAY_NAMES[weekday].slice(0, 3)}
          </span>
          <span className="font-heading text-2xl leading-none font-bold">{day}</span>
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold">{event.title}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-bold", KIND_STYLES[event.kind].chip)}>
            {EVENT_KIND_LABELS[event.kind]}
          </span>
        </span>
        <span className="text-sm text-muted-foreground">{event.description}</span>
      </span>
    </li>
  );
}

export function MonthCalendar() {
  const today = useStoreTime();
  const [chosen, setChosen] = useState<{ year: number; month: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!today) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando el calendario">
        <Skeleton className="h-12 w-64 rounded-full" />
        <Skeleton className="h-[26rem] rounded-3xl" />
      </div>
    );
  }

  const view = chosen ?? { year: today.year, month: today.month };
  const days = monthDays(view.year, view.month);
  const isCurrentMonth = view.year === today.year && view.month === today.month;
  const leadingBlanks = WEEK_ORDER.indexOf(days[0].weekday);
  const trailingBlanks = (7 - ((leadingBlanks + days.length) % 7)) % 7;
  const monthLabel = `${MONTH_NAMES[view.month - 1]} ${view.year}`;

  const go = (delta: number) => {
    setChosen(shiftMonth(view.year, view.month, delta));
    setSelectedDay(null);
  };

  // Las promos semanales se repiten todos los meses; en la lista del mes solo van las fechas puntuales.
  const highlights = days.flatMap((day) =>
    sortEvents(day.events)
      .filter((event) => event.rule.type !== "weekly")
      .map((event) => ({ event, day: day.day, weekday: day.weekday })),
  );
  const weekly = [...new Map(days.flatMap((day) => day.events).filter((event) => event.rule.type === "weekly").map((event) => [event.id, event])).values()];
  const selected = selectedDay ? days[selectedDay - 1] : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-xl" onClick={() => go(-1)} aria-label="Mes anterior" className="bg-card">
            <ChevronLeftIcon />
          </Button>
          <h2 aria-live="polite" className="min-w-52 text-center text-2xl font-bold text-primary sm:text-3xl">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon-xl" onClick={() => go(1)} aria-label="Mes siguiente" className="bg-card">
            <ChevronRightIcon />
          </Button>
        </div>
        {!isCurrentMonth && (
          <Button
            variant="ghost"
            size="lg"
            onClick={() => {
              setChosen(null);
              setSelectedDay(null);
            }}
            className="h-11 rounded-full px-4 text-primary"
          >
            <CalendarDaysIcon aria-hidden="true" />
            Volver a hoy
          </Button>
        )}
      </div>

      <Legend />

      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="grid grid-cols-7 border-b bg-cream text-center text-xs font-bold tracking-wider text-primary uppercase">
          {WEEK_ORDER.map((weekday) => (
            <div key={weekday} className="py-2.5">
              <span className="sm:hidden">{WEEKDAY_NAMES[weekday].slice(0, 2)}</span>
              <span className="hidden sm:inline">{WEEKDAY_NAMES[weekday]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: leadingBlanks }, (_, index) => (
            <div key={`vacio-${index}`} className="border-r border-b bg-muted/40" />
          ))}
          {days.map((day) => {
            const events = sortEvents(day.events);
            const isToday = isCurrentMonth && day.day === today.day;
            const isSelected = selectedDay === day.day;
            const label = `${WEEKDAY_NAMES[day.weekday]} ${day.day} de ${MONTH_NAMES[view.month - 1].toLowerCase()}${
              events.length ? `: ${events.map((event) => event.title).join(", ")}` : ", sin fechas destacadas"
            }`;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => setSelectedDay(isSelected ? null : day.day)}
                aria-label={label}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex min-h-16 flex-col items-stretch gap-1 border-r border-b p-1.5 text-left outline-none transition-colors hover:bg-secondary focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60 sm:min-h-28 sm:p-2 [&:nth-child(7n)]:border-r-0",
                  isSelected && "bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center self-start rounded-full text-sm font-bold tabular-nums",
                    isToday && "bg-pink-deep text-white",
                  )}
                >
                  {day.day}
                </span>
                <span className="flex flex-wrap gap-1 sm:hidden" aria-hidden="true">
                  {events.map((event) => (
                    <span key={event.id} className={cn("size-2.5 rounded-full", KIND_STYLES[event.kind].dot)} />
                  ))}
                </span>
                <span className="hidden flex-col gap-1 sm:flex" aria-hidden="true">
                  {events.slice(0, 3).map((event) => (
                    <span
                      key={event.id}
                      className={cn(
                        "truncate rounded-md px-1.5 py-0.5 text-[0.6875rem] leading-4 font-semibold",
                        KIND_STYLES[event.kind].chip,
                      )}
                    >
                      {event.title}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
          {Array.from({ length: trailingBlanks }, (_, index) => (
            <div key={`fin-${index}`} className="border-r border-b bg-muted/40 [&:nth-child(7n)]:border-r-0" />
          ))}
        </div>
      </div>

      {selected && (
        <section aria-live="polite" className="flex flex-col gap-3">
          <h3 className="text-xl font-bold text-primary">
            {WEEKDAY_NAMES[selected.weekday]} {selected.day} de {MONTH_NAMES[view.month - 1].toLowerCase()}
          </h3>
          {selected.events.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {sortEvents(selected.events).map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </ul>
          ) : (
            <p className="text-base text-muted-foreground">
              Sin fechas destacadas este día. Igual siempre hay espacio para un helado.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="mes-titulo" className="flex flex-col gap-3">
        <h3 id="mes-titulo" className="text-xl font-bold text-primary">
          Fechas de {MONTH_NAMES[view.month - 1].toLowerCase()}
        </h3>
        {highlights.length > 0 ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {highlights.map(({ event, day, weekday }) => (
              <EventItem key={`${event.id}-${day}`} event={event} day={day} weekday={weekday} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed bg-card p-5 text-base text-muted-foreground">
            Este mes no hay fechas especiales cargadas.
          </p>
        )}
        {weekly.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {weekly.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
