import type { VenueConfig } from "@/types/booking";

/**
 * Format an integer minor-unit amount (e.g. 105000) as localized currency
 * using the venue's currency config. Always integer end to end — this is a
 * pure display helper.
 */
export function formatMoney(minor: number, currency: VenueConfig["currency"]): string {
  const amount = minor / currency.minorUnit;
  const whole = Number.isInteger(amount);
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${formatted}`;
}