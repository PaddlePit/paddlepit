"use client";

import { useCallback, useMemo, useState } from "react";
import type { SlotRef, VenueConfig } from "@/types/booking";
import {
  countSelectionByCourt,
  countSelectionByDate,
  slotKey,
} from "@/services/mappers";
import {
  distinctCourtCount,
  distinctDayCount,
  totalSelectedMinutes,
} from "@/lib/pricing";

/**
 * Selection holds slot identities ONLY (courtId + start ISO) — never prices.
 * The grid/cells toggle into here; totals are derived helpers used purely for
 * display; the server recomputes the authoritative total on hold.
 */
export interface BookingSelection {
  slots: SlotRef[];
  removeMany: (slots: SlotRef[]) => void;
  toggle: (slot: SlotRef) => void;
  clear: () => void;
  countByDate: Record<string, number>;
  countByCourt: Record<string, number>;
  summary: { minutes: number; courts: number; days: number };
  isEmpty: boolean;
}

export function useBookingSelection(
  venue: VenueConfig | undefined
): BookingSelection {
  const [slots, setSlots] = useState<SlotRef[]>([]);

  const removeMany = useCallback((target: SlotRef[]) => {
    const banned = new Set(target.map(slotKey));
    setSlots((prev) => prev.filter((s) => !banned.has(slotKey(s))));
  }, []);

  const toggle = useCallback(
    (slot: SlotRef) => {
      setSlots((prev) => {
        const exists = prev.some(
          (s) => s.courtId === slot.courtId && s.start === slot.start
        );
        if (exists) return prev.filter((s) => s.courtId !== slot.courtId || s.start !== slot.start);
        return [...prev, slot];
      });
    },
    []
  );

  const clear = useCallback(() => setSlots([]), []);

  const timezone = venue?.timezone ?? "UTC";

  const memo = useMemo(() => {
    return {
      countByDate: countSelectionByDate(slots, timezone),
      countByCourt: countSelectionByCourt(slots),
      summary: {
        minutes: totalSelectedMinutes(slots, venue?.slotMinutes ?? 60),
        courts: distinctCourtCount(slots),
        days: distinctDayCount(slots, timezone),
      },
    };
  }, [slots, timezone, venue?.slotMinutes]);

  return {
    slots,
    removeMany,
    toggle,
    clear,
    isEmpty: slots.length === 0,
    ...memo,
  };
}