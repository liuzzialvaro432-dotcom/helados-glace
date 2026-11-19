import { WEEKLY_HOURS, type Shift } from "@/data/catalog";
import { storeTime, WEEKDAY_NAMES } from "@/lib/time";

export type StoreStatus =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: string }
  | { open: false; opensAt: null; opensDay: null };

function toMinutes(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getStoreStatus(now: Date, weeklyHours: Shift[][] = WEEKLY_HOURS): StoreStatus {
  const local = storeTime(now);
  const minutes = local.hour * 60 + local.minute;
  const today = weeklyHours[local.weekday] ?? [];

  const current = today.find((shift) => minutes >= toMinutes(shift.open) && minutes < toMinutes(shift.close));
  if (current) return { open: true, closesAt: current.close };

  const laterToday = today.find((shift) => minutes < toMinutes(shift.open));
  if (laterToday) return { open: false, opensAt: laterToday.open, opensDay: "hoy" };

  for (let offset = 1; offset <= 7; offset += 1) {
    const weekday = (local.weekday + offset) % 7;
    const first = weeklyHours[weekday]?.[0];
    if (first) {
      const opensDay = offset === 1 ? "mañana" : `el ${WEEKDAY_NAMES[weekday].toLowerCase()}`;
      return { open: false, opensAt: first.open, opensDay };
    }
  }
  return { open: false, opensAt: null, opensDay: null };
}

export function statusLabel(status: StoreStatus): string {
  if (status.open) return `Abierto · hasta ${status.closesAt}`;
  if (status.opensAt) return `Cerrado · abre ${status.opensDay} a las ${status.opensAt}`;
  return "Cerrado";
}

/** Horario semanal agrupado por días consecutivos con el mismo horario, empezando en lunes. */
export function weeklyHoursSummary(weeklyHours: Shift[][] = WEEKLY_HOURS): { days: string; hours: string }[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const textFor = (weekday: number) => {
    const shifts = weeklyHours[weekday] ?? [];
    return shifts.length ? shifts.map((shift) => `${shift.open} a ${shift.close}`).join(" y ") : "Cerrado";
  };
  const groups: { first: number; last: number; hours: string }[] = [];
  for (const weekday of order) {
    const hours = textFor(weekday);
    const previous = groups[groups.length - 1];
    if (previous && previous.hours === hours) previous.last = weekday;
    else groups.push({ first: weekday, last: weekday, hours });
  }
  return groups.map((group) => ({
    days:
      group.first === group.last
        ? WEEKDAY_NAMES[group.first]
        : `${WEEKDAY_NAMES[group.first]} a ${WEEKDAY_NAMES[group.last].toLowerCase()}`,
    hours: group.hours,
  }));
}
