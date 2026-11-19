"use client";

import { useMemo, useSyncExternalStore } from "react";

import { storeTime, type LocalTime } from "@/lib/time";

const REFRESH_MS = 30_000;

let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      current = new Date();
      listeners.forEach((notify) => notify());
    }, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot(): Date {
  if (!current) current = new Date();
  return current;
}

/** Hora actual, refrescada cada 30 s. Es null en el servidor y hasta la hidratación. */
export function useNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** Fecha y hora del local (America/Asuncion); null hasta la hidratación. */
export function useStoreTime(): LocalTime | null {
  const now = useNow();
  const minute = now ? Math.floor(now.getTime() / 60_000) : null;
  return useMemo(() => (minute === null ? null : storeTime(new Date(minute * 60_000))), [minute]);
}

const noop = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
