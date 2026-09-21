"use client";

import { Dialog } from "radix-ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BreakdownLines } from "./BreakdownLines";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { formatMoney } from "@/lib/money";
import type { BreakdownData } from "@/services/mappers";
import type { VenueConfig } from "@/types/booking";

interface BookingBreakdownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: VenueConfig;
  estimated: BreakdownData;
  onCheckout: () => void;
}

/**
 * Floating review modal. Styled to match the navbar (max-w-[950], rounded-3xl,
 * bg-cream, px-[20] py-[16], shadow-lg) so it reads as part of the same chrome.
 */
export function BookingBreakdownSheet({
  open,
  onOpenChange,
  venue,
  estimated,
  onCheckout,
}: BookingBreakdownSheetProps) {
  const isEmpty = estimated.days.length === 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[80] flex max-h-[calc(100dvh-3rem)] w-full max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-3xl bg-cream px-[20] py-[16] shadow-lg shadow-emerald-deep/10 ring-1 ring-emerald-deep/10 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-[950px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="font-heading text-base leading-none font-semibold text-emerald-deep">
                Review your booking
              </Dialog.Title>
              <Dialog.Description className="text-xs text-emerald-deep/50">
                Prices are an estimate; the confirmed total appears on the payment page.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                className="shrink-0 rounded-full bg-emerald-deep/5 text-emerald-deep/60 hover:text-clay-deep"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </Button>
            </Dialog.Close>
          </div>

          <ScrollArea className="max-h-[46vh] min-h-0 pr-5 overflow-scroll">
            {isEmpty ? (
              <p className="py-8 text-center text-sm text-emerald-deep/50">
                No slots selected yet.
              </p>
            ) : (
              <BreakdownLines data={estimated} venue={venue} />
            )}
          </ScrollArea>

          <div className="pt-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs tracking-wide text-emerald-deep/50 uppercase">
                Estimated total
              </span>
              <span className="font-serif text-xl font-semibold text-emerald-deep">
                {formatMoney(estimated.totalMinor, venue.currency)}
              </span>
            </div>
            <Separator className="mb-3" />
            <Button
              onClick={onCheckout}
              disabled={isEmpty}
              className="w-full rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
            >
              Proceed to Payment
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
