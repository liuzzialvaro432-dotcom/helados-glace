import { describe, expect, it } from "vitest";

import { daysInMonth, eventsOn, monthDays, shiftMonth, weekdayOf } from "@/lib/calendar";

const titles = (year: number, month: number, day: number) => eventsOn(year, month, day).map((event) => event.title);

describe("calendario", () => {
  it("conoce el largo de cada mes", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 11)).toBe(30);
  });

  it("calcula el día de la semana", () => {
    expect(weekdayOf(2026, 11, 19)).toBe(4);
    expect(weekdayOf(2026, 8, 16)).toBe(0);
  });

  it("avanza y retrocede meses cruzando el año", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 11, -11)).toEqual({ year: 2025, month: 12 });
  });

  it("marca las fechas clave de agosto", () => {
    expect(titles(2026, 8, 14)).toContain("Día de la Bandera");
    expect(titles(2027, 8, 16)).toContain("Día del Niño");
  });

  it("marca los partidos de Paraguay solo en su fecha", () => {
    expect(titles(2026, 11, 17)).toContain("Japón vs. Paraguay");
    expect(titles(2027, 11, 17)).not.toContain("Japón vs. Paraguay");
  });

  it("el Día del Padre cae el tercer domingo de junio", () => {
    expect(titles(2026, 6, 21)).toContain("Día del Padre");
    expect(titles(2027, 6, 20)).toContain("Día del Padre");
    expect(titles(2026, 6, 14)).not.toContain("Día del Padre");
  });

  it("repite la promo de los jueves", () => {
    const thursdays = monthDays(2026, 11).filter((day) => day.events.some((event) => event.kind === "promo"));
    expect(thursdays.map((day) => day.day)).toEqual([5, 12, 19, 26]);
  });
});
