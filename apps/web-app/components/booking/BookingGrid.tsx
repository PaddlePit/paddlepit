"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SlotCell, SLOT_STATUS_TEXT, type SlotStatus } from "./SlotCell";
import { SlotLegend } from "./SlotLegend";
import { formatMoney } from "@/lib/money";
import { formatLongDate, formatTimeRange, isPastSlot } from "@/lib/time-slots";
import type { ISODate, ISODateTime, SlotRef, VenueConfig } from "@/types/booking";

interface BookingGridProps {
  venue: VenueConfig;
  date: ISODate;
  slotStarts: ISODateTime[];
  unavailableKeys: Set<string>;
  selectedKeys: Set<string>;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  /** Effective "now" (server time + drift), used for past detection. */
  nowISO: ISODateTime;
  hidePast: boolean;
  hoveredCourtId: string | null;
  onHoverCourt: (courtId: string | null) => void;
  onToggleSlot: (slot: SlotRef) => void;
  onRetry: () => void;
  onJumpNextDay: () => void;
}

function GridHeader({
  venue,
  template,
}: {
  venue: VenueConfig;
  template: string;
}) {
  return (
    <div
      className="sticky top-0 z-20 grid gap-1 bg-cream pb-2 sm:gap-1.5"
      style={{ gridTemplateColumns: template }}
    >
      <div className="sticky left-0 z-10 flex items-end bg-cream pl-1 pb-1 text-[10px] font-semibold tracking-wider text-emerald-deep/40 uppercase">
        Time
      </div>
      {venue.courts.map((court) => (
        <div key={court.id} className="px-1 pb-1 text-center">
          <p className="truncate text-xs font-semibold text-emerald-deep">{court.name}</p>
          <p className="text-[10px] text-emerald-deep/45">
            {formatMoney(court.hourlyRateMinor, venue.currency)}/hr
          </p>
        </div>
      ))}
    </div>
  );
}

function SkeletonGrid({ venue }: { venue: VenueConfig }) {
  const rows = Math.min(8, Math.max(4, venue.closeHour - venue.openHour));
  const template = `minmax(var(--pp-time-col), 1fr) repeat(${venue.courts.length}, minmax(var(--pp-court-col), 1fr))`;
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-1.5" style={{ gridTemplateColumns: template }}>
      <Skeleton className="h-8" />
      {venue.courts.map((c) => (
        <Skeleton key={c.id} className="h-8" />
      ))}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="contents">
          <Skeleton className="h-12" />
          {venue.courts.map((c) => (
            <Skeleton key={c.id} className="h-12" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function BookingGrid({
  venue,
  date,
  slotStarts,
  unavailableKeys,
  selectedKeys,
  isLoading,
  isError,
  isRefetching,
  nowISO,
  hidePast,
  hoveredCourtId,
  onHoverCourt,
  onToggleSlot,
  onRetry,
  onJumpNextDay,
}: BookingGridProps) {
  const template = `minmax(var(--pp-time-col), 1fr) repeat(${venue.courts.length}, minmax(var(--pp-court-col), 1fr))`;

  const visibleStarts = useMemo(
    () => (hidePast ? slotStarts.filter((s) => !isPastSlot(s, nowISO)) : slotStarts),
    [slotStarts, hidePast, nowISO]
  );

  const allPast = slotStarts.length > 0 && visibleStarts.length === 0;

  return (
    <section className="[--pp-time-col:76px] [--pp-court-col:58px] sm:[--pp-time-col:96px] sm:[--pp-court-col:72px] rounded-2xl border border-emerald-deep/10 bg-cream p-2.5 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold tracking-wider text-emerald-deep/50 uppercase">
          Available Slots ·{" "}
          <span className="text-emerald-deep/70 normal-case">{formatLongDate(date, venue.timezone)}</span>
        </h3>
        {isRefetching && (
          <span className="text-[10px] tracking-wide text-emerald-deep/40 uppercase">
            Updating…
          </span>
        )}
      </div>

      {isLoading && !isError && <SkeletonGrid venue={venue} />}

      {isError && !isLoading && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-clay-mid/40 bg-clay-pale px-4 py-8 text-center"
        >
          <p className="text-sm font-medium text-clay-deep">
            We couldn&apos;t load availability.
          </p>
          <p className="text-xs text-clay-deep/70">
            Check your connection and try again — your selection is safe.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl">
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && allPast && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-deep/10 bg-emerald-pale px-4 py-8 text-center">
          <p className="font-serif text-base text-emerald-deep">No more slots today</p>
          <p className="text-xs text-emerald-deep/50">
            Today&apos;s remaining times have passed. Try tomorrow instead.
          </p>
          <Button size="sm" onClick={onJumpNextDay} className="rounded-xl bg-emerald-deep text-cream">
            Jump to next day
          </Button>
        </div>
      )}

      {!isLoading && !isError && !allPast && (
        <div
          className="overflow-x-auto overscroll-x-contain"
          onMouseLeave={() => onHoverCourt(null)}
        >
          <div className="min-w-[280px]">
            <GridHeader venue={venue} template={template} />
            <div className="grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: template }}>
              {visibleStarts.map((start) => {
                const past = isPastSlot(start, nowISO);
                const timeLabel = formatTimeRange(start, venue.slotMinutes, venue.timezone);
                return (
                  <div key={start} className="contents">
                    <div
                      className={cn(
                        "sticky left-0 z-10 flex h-12 items-center rounded-xl bg-cream pr-2 pl-1 text-[10px] font-medium leading-tight sm:text-xs",
                        past ? "text-emerald-deep/25" : "text-emerald-deep/70"
                      )}
                    >
                      {timeLabel}
                    </div>
                    {venue.courts.map((court) => {
                      const key = `${court.id}|${start}`;
                      let status: SlotStatus = "available";
                      if (past) status = "past";
                      else if (selectedKeys.has(key)) status = "selected";
                      else if (unavailableKeys.has(key)) status = "booked";
                      return (
                        <SlotCell
                          key={court.id}
                          status={status}
                          columnHovered={hoveredCourtId === court.id}
                          label={`${court.name}, ${timeLabel}, ${SLOT_STATUS_TEXT[status]}`}
                          onClick={() => onToggleSlot({ courtId: court.id, start })}
                          onMouseEnter={() => onHoverCourt(court.id)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-emerald-deep/10 pt-3">
        <SlotLegend />
      </div>
    </section>
  );
}