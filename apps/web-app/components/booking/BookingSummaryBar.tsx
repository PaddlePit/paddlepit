"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronUpIcon } from "@hugeicons/core-free-icons";
import { formatMoney } from "@/lib/money";
import { totalMinutesText } from "@/lib/time-slots";
import type { VenueConfig } from "@/types/booking";

interface BookingSummaryBarProps {
  visible: boolean;
  summary: { minutes: number; courts: number; days: number };
  totalMinor: number;
  venue: VenueConfig;
  onClear: () => void;
  onOpenBreakdown: () => void;
}

export function BookingSummaryBar({
  visible,
  summary,
  totalMinor,
  venue,
  onClear,
  onOpenBreakdown,
}: BookingSummaryBarProps) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] border-t border-emerald-deep/10 bg-cream/95 backdrop-blur",
        "transition-transform duration-200 ease-out",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3">
        <button
          type="button"
          onClick={onOpenBreakdown}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-emerald-deep sm:text-sm">
              {totalMinutesText(summary.minutes)} · {summary.courts}{" "}
              {summary.courts === 1 ? "court" : "courts"} · {summary.days}{" "}
              {summary.days === 1 ? "day" : "days"}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-deep/45">
              <HugeiconsIcon
                icon={ChevronUpIcon}
                strokeWidth={2}
                className="size-3 transition-transform duration-200 group-hover:-translate-y-0.5"
              />
              Estimated · tap to review
            </span>
          </span>
        </button>

        <span className="shrink-0 text-right">
          <span className="block font-serif text-lg font-semibold text-emerald-deep sm:text-xl">
            {formatMoney(totalMinor, venue.currency)}
          </span>
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="shrink-0 rounded-xl text-emerald-deep/60"
        >
          Clear
        </Button>

        <Button
          onClick={onOpenBreakdown}
          className="shrink-0 rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
        >
          <span className="hidden sm:inline">Review booking</span>
          <span className="sm:hidden">Review</span>
        </Button>
      </div>
    </div>
  );
}