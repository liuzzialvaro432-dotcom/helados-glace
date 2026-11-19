import { EVENTS, type CalendarEvent } from "@/data/events";
import { toDateKey } from "@/lib/time";

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = domingo … 6 = sábado, para una fecha de calendario (sin zona horaria). */
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function occursOn(event: CalendarEvent, year: number, month: number, day: number): boolean {
  const rule = event.rule;
  switch (rule.type) {
    case "annual":
      return rule.month === month && rule.day === day;
    case "date":
      return rule.date === toDateKey(year, month, day);
    case "weekly":
      return rule.weekday === weekdayOf(year, month, day);
    case "nthWeekday":
      return (
        rule.month === month && rule.weekday === weekdayOf(year, month, day) && Math.ceil(day / 7) === rule.nth
      );
  }
}

export function eventsOn(
  year: number,
  month: number,
  day: number,
  events: CalendarEvent[] = EVENTS,
): CalendarEvent[] {
  return events.filter((event) => occursOn(event, year, month, day));
}

export type CalendarDay = { day: number; weekday: number; events: CalendarEvent[] };

export function monthDays(year: number, month: number, events: CalendarEvent[] = EVENTS): CalendarDay[] {
  return Array.from({ length: daysInMonth(year, month) }, (_, index) => {
    const day = index + 1;
    return { day, weekday: weekdayOf(year, month, day), events: eventsOn(year, month, day, events) };
  });
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
