"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookingConfirmed } from "@/components/booking/BookingConfirmed";

function SuccessBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 text-center">
        <h1 className="font-serif text-2xl font-semibold text-emerald-deep">
          Booking not found
        </h1>
        <p className="mt-2 text-sm text-emerald-deep/60">
          We couldn&apos;t find a booking reference. If you just paid, check
          your email for your confirmation.
        </p>
        <Button
          onClick={() => router.push("/book")}
          className="mt-5 rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
        >
          Back to booking
        </Button>
      </div>
    );
  }

  return <BookingConfirmed bookingId={bookingId} />;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessBody />
    </Suspense>
  );
}