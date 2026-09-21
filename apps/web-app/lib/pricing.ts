import type { Court, SlotRef } from "@/types/booking";
import { isoToBusinessDate } from "@/lib/time-slots";

/** Integer-minor price of a single slot/run of `minutes` on `court`. */
export function courtRateMinor(court: Court | undefined, minutes: number): number {
  if (!court) return 0;
  return Math.round((court.hourlyRateMinor * minutes) / 60);
}

export function totalSelectedMinutes(slots: SlotRef[], slotMinutes: number): number {
  return slots.length * slotMinutes;
}

export function distinctCourtCount(slots: SlotRef[]): number {
  return new Set(slots.map((s) => s.courtId)).size;
}

export function distinctDayCount(slots: SlotRef[], timeZone: string): number {
  return new Set(slots.map((s) => isoToBusinessDate(s.start, timeZone))).size;
}