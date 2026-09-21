"use client";

import { useCallback, useMemo, useState } from "react";
import type { Court, SlotRef, VenueConfig } from "@/types/booking";
import {
  countSelectionByCourt,
  countSelectionByDate,
  slotKey,
} from "@/services/mappers";
import {
  distinctCourtCount,
  distinctDayCount,
  estimatedTotalMinor,
  totalSelectedMinutes,
} from "@/lib/pricing";

/**
 * Selection holds slot identities ONLY (courtId + start ISO) — never prices.
 * The grid/cells toggle into here; totals are derived helpers used purely for
 * display; the server recomputes the authoritative total on hold.
 */
export interface BookingSelection {
  slots: SlotRef[];
  isSelected: (slot: SlotRef) => boolean;
  add: (slot: SlotRef) => void;
  remove: (slot: SlotRef) => void;
  removeMany: (slots: SlotRef[]) => void;
  toggle: (slot: SlotRef) => void;
  clear: () => void;
  countByDate: Record<string, number>;
  countByCourt: Record<string, number>;
  summary: { minutes: number; courts: number; days: number };
  estimatedMinor: number;
  isEmpty: boolean;
}

export function useBookingSelection(
  venue: VenueConfig | undefined
): BookingSelection {
  const [slots, setSlots] = useState<SlotRef[]>([]);

  const isSelected = useCallback(
    (slot: SlotRef) => slots.some((s) => s.courtId === slot.courtId && s.start === slot.start),
    [slots]
  );

  const add = useCallback((slot: SlotRef) => {
    setSlots((prev) =>
      prev.some((s) => s.courtId === slot.courtId && s.start === slot.start)
        ? prev
        : [...prev, slot]
    );
  }, []);

  const remove = useCallback((slot: SlotRef) => {
    setSlots((prev) =>
      prev.filter((s) => s.courtId !== slot.courtId || s.start !== slot.start)
    );
  }, []);

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
      estimatedMinor: estimatedTotalMinor(slots, (venue?.courts ?? []) as Court[]),
    };
  }, [slots, timezone, venue?.courts, venue?.slotMinutes]);

  return {
    slots,
    isSelected,
    add,
    remove,
    removeMany,
    toggle,
    clear,
    isEmpty: slots.length === 0,
    ...memo,
  };
}