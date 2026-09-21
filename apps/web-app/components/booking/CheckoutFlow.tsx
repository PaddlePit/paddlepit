"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { useVenueConfig } from "@/hooks/useVenueConfig";
import { useCreateHold } from "@/hooks/useCreateHold";
import { useCheckout } from "@/hooks/useCheckout";
import { useBookingService } from "@/services/context";
import {
  buildEstimatedBreakdown,
  buildServerBreakdown,
  parseSlotKey,
  type BreakdownData,
} from "@/services/mappers";
import { formatMoney } from "@/lib/money";
import { BreakdownLines } from "./BreakdownLines";
import { CheckoutCustomerForm, type CustomerErrors } from "./CheckoutCustomerForm";
import { CheckoutVoucher } from "./CheckoutVoucher";
import { BookingConfirmed } from "./BookingConfirmed";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/types/booking";
import type {
  CheckoutResponse,
  CreateHoldResponse,
  CustomerInfo,
  ISODateTime,
  SlotRef,
  Voucher,
} from "@/types/booking";

interface ServerBreakdown {
  breakdown: BreakdownData;
  totalMinor: number;
  expiresAt: ISODateTime;
}

function newIdempotencyKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function parseSlots(rawParams: string[]): SlotRef[] {
  const slots: SlotRef[] = [];
  for (const key of rawParams) {
    if (!key.includes("|")) continue;
    const { courtId, start } = parseSlotKey(key);
    if (courtId && !Number.isNaN(new Date(start).getTime())) slots.push({ courtId, start });
  }
  return slots;
}

function remainingMs(expiresAt: ISODateTime, nowMs: number): number {
  return new Date(expiresAt).getTime() - nowMs;
}

function formatCountdown(expiresAt: ISODateTime, nowMs: number): string {
  const remaining = remainingMs(expiresAt, nowMs);
  if (remaining <= 0) return "expired";
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const slots = useMemo(() => parseSlots(searchParams.getAll("slots")), [searchParams]);

  const venueQuery = useVenueConfig();
  const venue = venueQuery.data;

  const createHold = useCreateHold();
  const checkout = useCheckout();
  const service = useBookingService();

  const [held, setHeld] = useState<CreateHoldResponse | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckoutResponse | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>({ name: "", email: "", phone: "" });
  const [customerErrors, setCustomerErrors] = useState<CustomerErrors>({});
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [pendingPayment, setPendingPayment] = useState<CheckoutResponse | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const requestStartedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  // Create the hold once the venue and slots are known. A one-shot ref guard
  // (reset only by "Try again") prevents re-running, which stops `mutate` from
  // bouncing `setState` back and forth and hitting the render-depth limit.
  // `createHold` is memoized, so this effect does not re-fire on idle renders.
  useEffect(() => {
    if (!venue || slots.length === 0 || success || requestStartedRef.current) return;
    requestStartedRef.current = true;
    createHold.mutate({ slots }).then(
      (h) => setHeld(h),
      (error: unknown) => {
        if (error instanceof ApiError && error.code === "SLOT_CONFLICT") {
          setHoldError(
            "Some of those slots were just taken. Go back and pick different times."
          );
        } else if (error instanceof ApiError && error.code === "HOLD_EXPIRED") {
          setHoldError("Your hold expired. Try again.");
        } else if (error instanceof ApiError) {
          setHoldError(error.message);
        } else {
          setHoldError("Something went wrong. Please try again.");
        }
      }
    );
  }, [venue, slots, success, createHold]);

  // Tick once per second while a hold is live to drive the countdown.
  useEffect(() => {
    if (!held || success) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [held, success]);

  const serverBreakdown: ServerBreakdown | null = useMemo(() => {
    if (!held || !venue) return null;
    return {
      breakdown: buildServerBreakdown(held.items, venue),
      totalMinor: held.totalMinor,
      expiresAt: held.expiresAt,
    };
  }, [held, venue]);

  const estimated = useMemo(
    () => (venue ? buildEstimatedBreakdown(slots, venue) : { days: [], totalMinor: 0 }),
    [slots, venue]
  );

  const data = serverBreakdown?.breakdown ?? estimated;
  const totalMinor = serverBreakdown?.totalMinor ?? estimated.totalMinor;
  const discountMinor = voucher?.discountMinor ?? 0;
  const netTotalMinor = Math.max(0, totalMinor - discountMinor);
  const expiresRemaining = held ? remainingMs(held.expiresAt, nowMs) : null;

  const retryHold = () => {
    requestStartedRef.current = false;
    setHoldError(null);
    setHeld(null);
  };

  const validateCustomer = (): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const next: CustomerErrors = {};
    if (!customer.name.trim()) next.name = "Please enter your name.";
    if (!emailPattern.test(customer.email.trim())) next.email = "Enter a valid email address.";
    setCustomerErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLeave = () => {
    setConfirmLeaveOpen(false);
    setPendingPayment(null);
    if (held && !success) {
      void service.releaseHold(held.holdId).catch(() => { });
    }
    router.back();
  };

  const goBack = () => {
    // Leaving while a hold is live warns the user: the release stops the
    // countdown and the slots go back on the market.
    if (held && !success) {
      setConfirmLeaveOpen(true);
      return;
    }
    handleLeave();
  };

  const handleConfirmPayment = async () => {
    if (!held || checkout.isLoading || success) return;
    if (expiresRemaining !== null && expiresRemaining <= 0) {
      setHoldError("Your hold expired. Try again.");
      setHeld(null);
      return;
    }
    if (!validateCustomer()) return;
    const idempotencyKey = idempotencyKeyRef.current ?? newIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;
    try {
      const result = await checkout.mutate({
        request: {
          holdId: held.holdId,
          customer,
          voucherCode: voucher?.code,
          // PayMongo redirects here after a successful payment; the backend
          // appends ?bookingId=… to this base URL.
          successUrl: `${window.location.origin}/checkout/success`,
        },
        idempotencyKey,
      });
      if (result.paymentUrl) {
        setPendingPayment(result); // scan-to-pay modal with QR + link
        return;
      }
      if (result.clientSecret) {
        // Hand off to a payment SDK (PayMongo) when integrated.
        toast.success("Redirecting to secure payment…");
        return;
      }
      setSuccess(result);
    } catch (error) {
      if (error instanceof ApiError && error.code === "SLOT_CONFLICT") {
        setHoldError("Some of those slots were just taken. Go back and pick different times.");
      } else if (error instanceof ApiError && error.code === "HOLD_EXPIRED") {
        setHoldError("Your hold expired. Try again.");
        setHeld(null);
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  if (success) {
    return (
      <div className="pt-0">
        <Toaster />
        <BookingConfirmed bookingId={success.bookingId} />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 text-center">
        <Toaster />
        <h1 className="font-serif text-2xl font-semibold text-emerald-deep">Checkout</h1>
        <p className="mt-2 text-sm text-emerald-deep/60">No slots were provided.</p>
        <Button
          onClick={() => router.push("/book")}
          className="mt-5 rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
        >
          Back to booking
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-28 pb-20">
      <Toaster />

      <button
        type="button"
        onClick={goBack}
        className="mb-5 inline-flex items-center gap-1.5 rounded-xl text-sm font-medium text-emerald-deep/60 transition-colors hover:text-emerald-deep"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        Back to booking
      </button>

      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-emerald-deep sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-emerald-deep/50">
          {venue ? venue.venueName : "Review your slots, then pay to confirm."}
        </p>
      </header>

      {venueQuery.isError && (
        <div className="rounded-2xl border border-clay-mid/40 bg-clay-pale px-4 py-6 text-center text-sm text-clay-deep">
          Couldn&apos;t load the venue. Go back and try again.
        </div>
      )}

      {!venue && !venueQuery.isError && (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      )}

      {venue && (
        <div className="space-y-6">
          {createHold.isLoading && (
            <div className="rounded-2xl border border-emerald-deep/10 bg-emerald-pale px-4 py-6 text-center text-sm font-medium text-emerald-deep">
              Holding your slots…
            </div>
          )}

          {holdError && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-clay-mid/40 bg-clay-pale px-4 py-6 text-center">
              <p className="text-sm font-medium text-clay-deep">{holdError}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goBack} className="rounded-xl">
                  Go back
                </Button>
                <Button size="sm" onClick={retryHold} className="rounded-xl bg-emerald-deep text-cream">
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!holdError && serverBreakdown && (
            <div className="mb-3 flex justify-center">
              <Badge
                variant={expiresRemaining !== null && expiresRemaining <= 0 ? "destructive" : "gold"}
                className="w-fit"
              >
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
                {expiresRemaining !== null && expiresRemaining <= 0
                  ? "Hold expired"
                  : `Slots held · expires in ${formatCountdown(serverBreakdown.expiresAt, nowMs)}`}
              </Badge>
            </div>
          )}

          <section className="rounded-2xl border border-emerald-deep/10 bg-cream p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold tracking-wider text-emerald-deep/50 uppercase">
              Your booking
            </h2>
            <BreakdownLines data={data} venue={venue} />
          </section>

          <CheckoutCustomerForm
            value={customer}
            errors={customerErrors}
            onChange={setCustomer}
          />

          <CheckoutVoucher
            amountMinor={totalMinor}
            currency={venue.currency}
            onChange={setVoucher}
          />

          <section className="rounded-2xl border border-emerald-deep/10 bg-cream p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wide text-emerald-deep/50 uppercase">
                {serverBreakdown ? "Confirmed total" : "Estimated total"}
              </span>
              <span className="font-serif text-xl font-semibold text-emerald-deep">
                {formatMoney(netTotalMinor, venue.currency)}
              </span>
            </div>
            {discountMinor > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-emerald-deep/60">
                  {voucher?.code} · {voucher?.label}
                </span>
                <span className="font-medium text-emerald-deep/70">
                  −{formatMoney(discountMinor, venue.currency)}
                </span>
              </div>
            )}
            <Separator className="my-4" />
            <Button
              onClick={handleConfirmPayment}
              disabled={
                checkout.isLoading ||
                createHold.isLoading ||
                (expiresRemaining !== null && expiresRemaining <= 0)
              }
              className="w-full rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
            >
              {checkout.isLoading && (
                <span
                  aria-hidden
                  className="size-3.5 animate-spin rounded-full border-2 border-cream/40 border-t-cream"
                />
              )}
              {checkout.isLoading
                ? "Processing payment…"
                : `Confirm & Pay · ${formatMoney(netTotalMinor, venue.currency)}`}
            </Button>
            <p className="mt-3 text-center text-xs text-emerald-deep/40">
              Your slots are held while you complete payment.
            </p>
          </section>
        </div>
      )}

      <Dialog
        open={pendingPayment !== null}
        onOpenChange={(open) => {
          if (!open) setPendingPayment(null);
        }}
      >
        <DialogContent className="gap-4 sm:max-w-sm p-5" showCloseButton>
          <DialogHeader>
            <DialogTitle>Scan to pay</DialogTitle>
            <DialogDescription>
              Pay securely with GCash, Maya, or a card. Your slots stay held
              while you finish payment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3">
            {pendingPayment?.qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- QR arrives as an image from PayMongo
              <img
                src={pendingPayment.qrCodeUrl}
                alt="PAYMONGO payment QR code"
                className="size-44 rounded-xl border border-emerald-deep/10 bg-white p-2"
              />
            ) : (
              <div className="flex size-44 items-center justify-center rounded-xl border border-dashed border-emerald-deep/20 text-sm text-emerald-deep/40">
                QR unavailable
              </div>
            )}
            <p className="text-center text-xs text-emerald-deep/55">
              or pay using this secure link
            </p>
            {pendingPayment?.paymentUrl && (
              <a
                href={pendingPayment.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-full break-all rounded-lg bg-emerald-pale px-3 py-1.5 text-center font-mono text-xs text-emerald-deep underline underline-offset-2"
              >
                {pendingPayment.paymentUrl}
              </a>
            )}
          </div>

          <p className="rounded-xl bg-cream px-3 py-2 text-center text-xs text-emerald-deep/55">
            Complete payment to continue — you&apos;ll be redirected back
            automatically to confirm your booking.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent className="gap-4 sm:max-w-sm p-5" showCloseButton>
          <DialogHeader>
            <DialogTitle>Leave checkout?</DialogTitle>
            <DialogDescription>
              Your slot hold will be released and the countdown stops. Other
              players could book those times before you come back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col-reverse gap-2">
            <Button
              onClick={handleLeave}
              variant="outline"
              className="w-full rounded-xl text-clay-deep"
            >
              Yes, leave
            </Button>
            <Button
              onClick={() => setConfirmLeaveOpen(false)}
              className="w-full rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
            >
              Keep my hold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
