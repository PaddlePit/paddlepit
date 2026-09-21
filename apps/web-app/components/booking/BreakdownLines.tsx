"use client";

import { formatMoney } from "@/lib/money";
import { formatLongDate, formatTimeRange, totalMinutesText } from "@/lib/time-slots";
import type { BreakdownData } from "@/services/mappers";
import type { VenueConfig } from "@/types/booking";

interface BreakdownLinesProps {
  data: BreakdownData;
  venue: VenueConfig;
}

/**
 * Shared read-only line-item renderer for the review modal and the checkout
 * page: a breakdown is grouped date → court → merged slot runs.
 */
export function BreakdownLines({ data, venue }: BreakdownLinesProps) {
  return (
    <div className="space-y-4">
      {data.days.map((day) => (
        <div key={day.date} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-deep">
              {formatLongDate(day.date, venue.timezone)}
            </p>
            <p className="text-xs font-medium text-emerald-deep/50">
              {formatMoney(day.subtotalMinor, venue.currency)}
            </p>
          </div>
          {day.courts.map((court) => (
            <div key={court.courtId} className="space-y-1.5">
              <p className="text-xs font-medium text-emerald-deep/60">{court.courtName}</p>
              {court.lines.map((line) => (
                <div
                  key={line.start}
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-deep/10 bg-emerald-pale px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-emerald-deep">
                      {formatTimeRange(line.start, line.minutes, venue.timezone)}
                    </p>
                    <p className="text-xs text-emerald-deep/40">{totalMinutesText(line.minutes)}</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-deep">
                    {formatMoney(line.priceMinor, venue.currency)}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}