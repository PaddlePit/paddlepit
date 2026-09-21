"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { BadgeCheckIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface BookingConfirmedProps {
  bookingId: string;
}

export function BookingConfirmed({ bookingId }: BookingConfirmedProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-light text-emerald-deep">
        <HugeiconsIcon icon={BadgeCheckIcon} strokeWidth={2} className="size-7" />
      </div>
      <h1 className="mt-4 text-center font-serif text-2xl font-semibold text-emerald-deep sm:text-3xl">
        Booking confirmed
      </h1>
      <p className="mt-2 text-center text-sm text-emerald-deep/60">
        Your payment went through and your court is reserved. A confirmation
        email is on its way.
      </p>
      <div className="mt-6 rounded-2xl border border-emerald-deep/10 bg-cream p-6 text-center shadow-sm">
        <p className="text-[10px] tracking-wider text-emerald-deep/45 uppercase">
          Booking reference
        </p>
        <p className="font-mono text-lg font-medium text-emerald-deep">{bookingId}</p>
        <Button
          onClick={() => router.push("/book")}
          className="mt-5 w-full rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
        >
          Book another court
        </Button>
      </div>
    </div>
  );
}