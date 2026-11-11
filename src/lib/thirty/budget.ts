// Server-only. Monthly spend ceiling: reserve at run start, settle at run end.
import { RESERVE_MICROS } from "./config";
import { utcMonth } from "./limits";
import { keys, type Store } from "./store";

const SEVENTY_DAYS = 70 * 24 * 3600;

export type Reservation = { monthKey: string; reservedMicros: number };

export function usdToMicros(usd: number): number {
  return Math.round(usd * 1_000_000);
}

/** Returns the reservation, or null when it would exceed the monthly cap. */
export async function reserveBudget(
  store: Store,
  now: Date,
  capUsd: number,
  reserveMicros: number = RESERVE_MICROS
): Promise<Reservation | null> {
  const monthKey = utcMonth(now);
  const key = keys.budget(monthKey);
  const total = await store.incrby(key, reserveMicros);
  if (total === reserveMicros) await store.expire(key, SEVENTY_DAYS);
  if (total > usdToMicros(capUsd)) {
    await store.incrby(key, -reserveMicros);
    return null;
  }
  return { monthKey, reservedMicros: reserveMicros };
}

/** Replaces the reservation with the actual spend (which may be more or less). */
export async function settleBudget(
  store: Store,
  reservation: Reservation,
  actualMicros: number
): Promise<void> {
  const delta = Math.round(actualMicros) - reservation.reservedMicros;
  if (delta !== 0) await store.incrby(keys.budget(reservation.monthKey), delta);
}

export async function releaseBudget(store: Store, reservation: Reservation): Promise<void> {
  await settleBudget(store, reservation, 0);
}

export async function monthSpendMicros(store: Store, now: Date): Promise<number> {
  return Number((await store.get(keys.budget(utcMonth(now)))) ?? 0) || 0;
}
