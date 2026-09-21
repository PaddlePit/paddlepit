"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import {
  addBusinessDays,
  daysOfWeek,
  formatDayPill,
  formatWeekRangeLabel,
  startOfWeek,
} from "@/lib/time-slots";
import type { ISODate } from "@/types/booking";

interface WeekDatePickerProps {
  selectedDate: ISODate;
  onSelectDate: (date: ISODate) => void;
  timezone: string;
  weekStartsOn: number;
  minDate: ISODate;
  maxDate: ISODate;
  selectionCountByDate: Record<string, number>;
  hidePast: boolean;
}

export function WeekDatePicker({
  selectedDate,
  onSelectDate,
  timezone,
  weekStartsOn,
  minDate,
  maxDate,
  selectionCountByDate,
  hidePast,
}: WeekDatePickerProps) {
  const selectedWeekStart = useMemo(
    () => startOfWeek(selectedDate, timezone, weekStartsOn),
    [selectedDate, timezone, weekStartsOn]
  );

  const minWeekStart = useMemo(
    () => startOfWeek(minDate, timezone, weekStartsOn),
    [minDate, timezone, weekStartsOn]
  );

  const days = useMemo(() => daysOfWeek(selectedWeekStart), [selectedWeekStart]);
  const visibleDays = useMemo(
    () => (hidePast ? days.filter((d) => d >= minDate) : days),
    [days, hidePast, minDate]
  );

  const prevDisabled = selectedWeekStart <= minWeekStart;
  const nextDisabled = addBusinessDays(selectedWeekStart, 6) >= maxDate;

  const goToWeek = (delta: number) => {
    const nextStart = addBusinessDays(selectedWeekStart, delta * 7);
    let target = nextStart <= minDate ? minDate : nextStart;
    if (target > maxDate) target = maxDate;
    if (target !== selectedDate) onSelectDate(target);
  };

  return (
    <section className="rounded-2xl border border-emerald-deep/10 bg-cream p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold tracking-wider text-emerald-deep/40 uppercase">
          Weekly Availability
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous week"
            disabled={prevDisabled}
            onClick={() => goToWeek(-1)}
            className="rounded-full text-emerald-deep disabled:opacity-30"
          >
            <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} />
          </Button>
          <span className="min-w-[96px] text-center text-xs font-medium text-emerald-deep/70 sm:min-w-[104px]">
            {formatWeekRangeLabel(visibleDays)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next week"
            disabled={nextDisabled}
            onClick={() => goToWeek(1)}
            className="rounded-full text-emerald-deep disabled:opacity-30"
          >
            <HugeiconsIcon icon={ChevronRightIcon} strokeWidth={2} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {visibleDays.map((date) => {
          const { label, day } = formatDayPill(date, timezone);
          const isSelected = date === selectedDate;
          const count = selectionCountByDate[date] ?? 0;
          const disabled = date < minDate || date > maxDate;
          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${label} ${day}${count ? `, ${count} selected` : ""}`}
              onClick={() => !disabled && onSelectDate(date)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-lg border px-1 py-1.5 transition-all duration-150 outline-none sm:rounded-xl sm:py-2",
                "focus-visible:ring-2 focus-visible:ring-gold/60",
                isSelected
                  ? "border-emerald-deep bg-emerald-deep text-cream shadow-sm"
                  : "border-emerald-deep/10 bg-emerald-pale text-emerald-deep hover:border-emerald-deep/30",
                disabled && "cursor-not-allowed border-transparent bg-transparent text-emerald-deep/20 hover:border-transparent"
              )}
            >
              <span className="text-[9px] font-medium tracking-wide opacity-70 sm:text-[10px]">{label}</span>
              <span className="text-[13px] font-semibold leading-none sm:text-sm">{day}</span>
              {count > 0 && (
                <Badge
                  variant="gold"
                  className="absolute -top-1.5 -right-1.5 size-4 justify-center p-0 text-[9px] font-bold"
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}