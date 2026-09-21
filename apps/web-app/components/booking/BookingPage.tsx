"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { WeekDatePicker } from "./WeekDatePicker";
import { CourtMapPreview } from "./CourtMapPreview";
import { BookingGrid } from "./BookingGrid";
import { BookingSummaryBar } from "./BookingSummaryBar";
import { BookingBreakdownSheet } from "./BookingBreakdownSheet";
import { useVenueConfig } from "@/hooks/useVenueConfig";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookingSelection } from "@/hooks/useBookingSelection";
import { uiConfig } from "@/services";
import {
  buildEstimatedBreakdown,
  buildUnavailableSlotKeys,
  countSelectionByCourt,
  slotKey,
} from "@/services/mappers";
import { formatMoney } from "@/lib/money";
import {
  addBusinessDays,
  generateSlotStarts,
  isoToBusinessDate,
  startOfWeek,
} from "@/lib/time-slots";
import type { ISODate, ISODateTime } from "@/types/booking";

// Only used to satisfy the summary bar before the venue resolves; the bar is
// hidden whenever the selection is empty, which is always the case pre-load.
const fallbackVenue = {
  venueId: "",
  venueName: "PaddlePit",
  timezone: "Asia/Manila",
  currency: { symbol: "₱", code: "PHP", minorUnit: 100 },
  openHour: 0,
  closeHour: 24,
  slotMinutes: 60,
  maxAdvanceDays: 30,
  courts: [],
};

export function BookingPage() {
  const router = useRouter();
  const venueQuery = useVenueConfig();
  const venue = venueQuery.data;

  const [selectedDate, setSelectedDate] = useState<ISODate | null>(null);
  const [hoveredCourtId, setHoveredCourtId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selection = useBookingSelection(venue);

  // Wall clock for countdowns and "past" row advancement (1s while a hold is
  // live, otherwise 30s). Stored in state so rendering stays pure.
  const [nowMs, setNowMs] = useState(() => Date.now());
  const nowISO: ISODateTime = new Date(nowMs).toISOString();

  const minDate = venue ? isoToBusinessDate(nowISO, venue.timezone) : null;
  const maxDate = venue && minDate ? addBusinessDays(minDate, venue.maxAdvanceDays) : null;

  // Default the selected date to the server's "today"; kept as derived state so
  // nothing does setState-in-effect. `activeDate` tracks the user's picks once
  // they make one.
  const activeDate: ISODate | null =
    selectedDate ?? (minDate && maxDate ? (minDate <= maxDate ? minDate : maxDate) : null);

  const weekStart = useMemo(
    () =>
      activeDate && venue
        ? startOfWeek(activeDate, venue.timezone, uiConfig.weekStartsOn)
        : null,
    [activeDate, venue]
  );

  const availability = useAvailability(weekStart);
  const availabilityServerTime = availability.data?.serverTime;

  // Each tick applies the server-clock drift so "past" is judged against the
  // server's time, never the client wall clock; availabilityServerTime also
  // resets the timer so the offset is picked up immediately when a response
  // arrives.
  useEffect(() => {
    const compute = () => {
      const now = Date.now();
      const drift = availabilityServerTime
        ? new Date(availabilityServerTime).getTime() - now
        : 0;
      setNowMs(now + drift);
    };
    const interval = 30000;
    const id = window.setInterval(compute, interval);
    const immediate = window.setTimeout(compute, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(immediate);
    };
  }, [availabilityServerTime]);

  const slotStarts = useMemo(
    () => (activeDate && venue ? generateSlotStarts(activeDate, venue) : []),
    [activeDate, venue]
  );

  const unavailableKeys = useMemo(
    () => buildUnavailableSlotKeys(availability.data),
    [availability.data]
  );

  const selectedKeys = useMemo(
    () => new Set(selection.slots.map(slotKey)),
    [selection.slots]
  );

  const selectedOnDate = useMemo(
    () =>
      activeDate && venue
        ? selection.slots.filter(
          (s) => isoToBusinessDate(s.start, venue.timezone) === activeDate
        )
        : [],
    [selection.slots, activeDate, venue]
  );
  const countByCourtForDate = useMemo(
    () => countSelectionByCourt(selectedOnDate),
    [selectedOnDate]
  );

  const estimated = useMemo(
    () => (venue ? buildEstimatedBreakdown(selection.slots, venue) : { days: [], totalMinor: 0 }),
    [selection.slots, venue]
  );

  const handleProceedToPayment = () => {
    if (selection.isEmpty || !venue) return;
    const params = new URLSearchParams();
    for (const slot of selection.slots) {
      params.append("slots", `${slot.courtId}|${slot.start}`);
    }
    setSheetOpen(false);
    router.push(`/checkout?${params.toString()}`);
  };

  const handleJumpNextDay = () => {
    if (!activeDate || !maxDate) return;
    const next = addBusinessDays(activeDate, 1);
    setSelectedDate(next > maxDate ? maxDate : next);
  };

  const handleCourtClick = (courtId: string) => {
    setHoveredCourtId(courtId);
    document.getElementById("booking-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const courts = venue?.courts ?? [];
  const rateRange =
    courts.length > 0
      ? (() => {
        const rates = courts.map((c) => c.hourlyRateMinor);
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        return min === max
          ? `${formatMoney(min, venue!.currency)}/hr`
          : `${formatMoney(min, venue!.currency)} – ${formatMoney(max, venue!.currency)}/hr`;
      })()
      : "";

  return (
    <div className="mx-auto max-w-[950] w-full px-4 pt-28 pb-32">
      <Toaster />

      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-emerald-deep sm:text-4xl">
          Check Availability
        </h1>
        <p className="mt-1 text-sm text-emerald-deep/50">
          {venue
            ? `${venue.venueName} · ${rateRange}`
            : "Real-time court availability and instant booking."}
        </p>
      </header>

      {venueQuery.isError && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl border border-clay-mid/40 bg-clay-pale px-4 py-8 text-center">
          <p className="text-sm font-medium text-clay-deep">We couldn&apos;t load the venue.</p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => venueQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {!venue && !venueQuery.isError && (
        <div className="space-y-4">
          <Skeleton className="h-[120px] rounded-2xl" />
          <Skeleton className="h-[150px] rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      )}

      {venue && activeDate && (
        <div className="space-y-4">
          <CourtMapPreview
            courts={courts}
            highlightedCourtIds={Object.keys(countByCourtForDate)}
            countByCourt={countByCourtForDate}
            hoveredCourtId={hoveredCourtId}
            onHoverCourt={setHoveredCourtId}
            onCourtClick={handleCourtClick}
            currency={venue.currency}
          />

          <WeekDatePicker
            selectedDate={activeDate}
            onSelectDate={setSelectedDate}
            timezone={venue.timezone}
            weekStartsOn={uiConfig.weekStartsOn}
            minDate={minDate ?? activeDate}
            maxDate={maxDate ?? activeDate}
            selectionCountByDate={selection.countByDate}
            hidePast={uiConfig.hidePastSlots}
          />

          <div id="booking-grid" className="scroll-mt-6">
            <BookingGrid
              venue={venue}
              date={activeDate}
              slotStarts={slotStarts}
              unavailableKeys={unavailableKeys}
              selectedKeys={selectedKeys}
              isLoading={availability.isLoading}
              isError={availability.isError}
              isRefetching={availability.isRefetching}
              nowISO={nowISO}
              hidePast={uiConfig.hidePastSlots}
              hoveredCourtId={hoveredCourtId}
              onHoverCourt={setHoveredCourtId}
              onToggleSlot={selection.toggle}
              onRetry={() => availability.refetch()}
              onJumpNextDay={handleJumpNextDay}
            />
          </div>
        </div>
      )}

      <BookingSummaryBar
        visible={!selection.isEmpty && !sheetOpen}
        summary={selection.summary}
        totalMinor={estimated.totalMinor}
        venue={venue ?? fallbackVenue}
        onClear={selection.clear}
        onOpenBreakdown={() => setSheetOpen(true)}
      />

      {venue && (
        <BookingBreakdownSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          venue={venue}
          estimated={estimated}
          onCheckout={handleProceedToPayment}
        />
      )}
    </div>
  );
}
