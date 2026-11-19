import { describe, expect, it } from "vitest";

import { getStoreStatus, statusLabel, weeklyHoursSummary } from "@/lib/hours";
import { storeTime } from "@/lib/time";

// Paraguay está en UTC-3 todo el año desde octubre de 2024.
const at = (iso: string) => new Date(iso);

describe("storeTime", () => {
  it("convierte a la hora de Asunción sin importar la zona del dispositivo", () => {
    expect(storeTime(at("2026-11-19T15:30:00Z"))).toEqual({
      year: 2026,
      month: 11,
      day: 19,
      weekday: 4,
      hour: 12,
      minute: 30,
    });
  });

  it("cambia de día según la hora local, no la UTC", () => {
    const local = storeTime(at("2026-11-20T01:00:00Z"));
    expect(local.day).toBe(19);
    expect(local.hour).toBe(22);
  });
});

describe("getStoreStatus", () => {
  it("abierto dentro del horario", () => {
    const status = getStoreStatus(at("2026-11-19T15:30:00Z"));
    expect(status).toEqual({ open: true, closesAt: "22:00" });
    expect(statusLabel(status)).toBe("Abierto · hasta 22:00");
  });

  it("cerrado antes de abrir: abre hoy", () => {
    const status = getStoreStatus(at("2026-11-19T11:00:00Z"));
    expect(statusLabel(status)).toBe("Cerrado · abre hoy a las 10:00");
  });

  it("cerrado a la hora exacta de cierre: abre mañana", () => {
    const status = getStoreStatus(at("2026-11-20T01:00:00Z"));
    expect(statusLabel(status)).toBe("Cerrado · abre mañana a las 10:00");
  });

  it("los lunes cierra a las 21:00", () => {
    expect(getStoreStatus(at("2026-11-23T23:30:00Z"))).toEqual({ open: true, closesAt: "21:00" });
    expect(getStoreStatus(at("2026-11-24T00:00:00Z")).open).toBe(false);
  });

  it("busca el próximo día con horario", () => {
    const onlyMonday = [[], [{ open: "10:00", close: "12:00" }], [], [], [], [], []];
    expect(statusLabel(getStoreStatus(at("2026-11-19T15:00:00Z"), onlyMonday))).toBe(
      "Cerrado · abre el lunes a las 10:00",
    );
    expect(statusLabel(getStoreStatus(at("2026-11-19T15:00:00Z"), [[], [], [], [], [], [], []]))).toBe("Cerrado");
  });
});

describe("weeklyHoursSummary", () => {
  it("agrupa días consecutivos con el mismo horario", () => {
    expect(weeklyHoursSummary()).toEqual([
      { days: "Lunes a miércoles", hours: "10:00 a 21:00" },
      { days: "Jueves a domingo", hours: "10:00 a 22:00" },
    ]);
  });
});
