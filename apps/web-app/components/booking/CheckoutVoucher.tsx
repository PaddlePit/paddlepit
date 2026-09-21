"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { DiscountTag01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useBookingService } from "@/services/context";
import { formatMoney } from "@/lib/money";
import type { VenueConfig, Voucher } from "@/types/booking";

interface CheckoutVoucherProps {
  amountMinor: number; // pre-discount total
  currency: VenueConfig["currency"];
  onChange: (voucher: Voucher | null) => void;
}

export function CheckoutVoucher({ amountMinor, currency, onChange }: CheckoutVoucherProps) {
  const service = useBookingService();

  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Enter a voucher code.");
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const found = await service.validateVoucher(code, {
        amountMinor,
        currency: currency.code,
      });
      if (found) {
        setVoucher(found);
        onChange(found);
      } else {
        setError("That voucher code isn't valid.");
      }
    } catch {
      setError("Couldn't check the voucher. Try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemove = () => {
    setVoucher(null);
    setCode("");
    setError(null);
    onChange(null);
  };

  return (
    <section className="rounded-2xl border border-emerald-deep/10 bg-cream p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold tracking-wider text-emerald-deep/50 uppercase">
        Voucher / promo code
      </h2>

      {voucher ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-deep/15 bg-emerald-pale px-3.5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <HugeiconsIcon
              icon={DiscountTag01Icon}
              strokeWidth={2}
              className="size-5 shrink-0 text-emerald-deep"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-emerald-deep">
                {voucher.code} · {voucher.label}
              </p>
              <p className="text-xs text-emerald-deep/55">
                −{formatMoney(voucher.discountMinor, currency)} off
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="shrink-0 rounded-xl text-clay-deep hover:text-clay-deep"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            aria-label="Voucher code"
            type="text"
            placeholder="PP10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleApply();
            }}
            disabled={applying}
            className="min-w-0 flex-1 rounded-xl border border-emerald-deep/15 bg-white/60 px-3.5 py-2.5 text-sm text-emerald-deep transition-colors outline-none placeholder:text-emerald-deep/35 focus:border-emerald-deep/40 focus:bg-white"
          />
          <Button
            onClick={() => void handleApply()}
            disabled={applying || !code.trim()}
            className="shrink-0 rounded-xl bg-emerald-deep text-cream hover:bg-emerald-mid"
          >
            {applying ? "Checking…" : "Apply"}
          </Button>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-clay-deep">{error}</p>}
    </section>
  );
}