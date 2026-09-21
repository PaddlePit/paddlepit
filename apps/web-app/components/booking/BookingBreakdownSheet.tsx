"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { formatMoney } from "@/lib/money";
import { formatLongDate, formatTimeRange } from "@/lib/time-slots";
import type { BreakdownData } from "@/services/mappers";
import type { VenueConfig } from "@/types/booking";

interface BookingBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: VenueConfig;
  estimated: BreakdownData;
  onRemoveLine: (slotKeys: string[]) => void;
  onClear: () => void;
  onCheckout: () => void;
}

function BreakdownLines({
  data,
  venue,
  removable,
  onRemoveLine,
}: {
  data: BreakdownData;
  venue: VenueConfig;
  removable: boolean;
  onRemoveLine: (slotKeys: string[]) => void;
}) {
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
          <div className="space-y-1.5">
            {day.courts.map((court) =>
              court.lines.map((line) => (
                <div
                  key={`${court.courtId}-${line.start}`}
                  className="flex items-center gap-2 rounded-xl border border-emerald-deep/10 bg-emerald-pale px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-emerald-deep">
                      {court.courtName}
                    </p>
                    <p className="text-xs text-emerald-deep/55">
                      {formatTimeRange(line.start, line.minutes, venue.timezone)}{" "}
                      <span className="text-emerald-deep/40">({line.minutes / 60} hrs)</span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-deep">
                    {formatMoney(line.priceMinor, venue.currency)}
                  </p>
                  {removable && (
                    <button
                      type="button"
                      aria-label={`Remove ${court.courtName} ${formatTimeRange(
                        line.start,
                        line.minutes,
                        venue.timezone
                      )}`}
                      onClick={() => onRemoveLine(line.slotKeys)}
                      className="shrink-0 rounded-full p-1 text-emerald-deep/35 transition-colors hover:bg-clay-pale hover:text-clay-deep"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingBreakdownSheet({
  open,
  onOpenChange,
  venue,
  estimated,
  onRemoveLine,
  onClear,
  onCheckout,
}: BookingBreakdownSheetProps) {
  const isEmpty = estimated.days.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0">
        <SheetHeader className="border-b border-emerald-deep/10 px-5 pt-5 pb-4">
          <SheetTitle>Review your booking</SheetTitle>
          <SheetDescription>
            Prices are an estimate; the confirmed total appears on the payment page.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="max-h-[46vh] px-5 py-4">
          {isEmpty ? (
            <p className="py-8 text-center text-sm text-emerald-deep/50">
              No slots selected yet.
            </p>
          ) : (
            <BreakdownLines
              data={estimated}
              venue={venue}
              removable
              onRemoveLine={onRemoveLine}
            />
          )}
        </ScrollArea>

        <div className="border-t border-emerald-deep/10 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs tracking-wide text-emerald-deep/50 uppercase">
              Estimated total
            </span>
            <span className="font-serif text-xl font-semibold text-emerald-deep">
              {formatMoney(estimated.totalMinor, venue.currency)}
            </span>
          </div>
          <Separator className="mb-3" />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClear}
              disabled={isEmpty}
              className="rounded-xl text-emerald-deep"
            >
              Clear
            </Button>
            <Button
              onClick={onCheckout}
              disabled={isEmpty}
              className="flex-1 rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}