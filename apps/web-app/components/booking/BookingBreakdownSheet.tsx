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
import { BreakdownLines } from "./BreakdownLines";
import { formatMoney } from "@/lib/money";
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
