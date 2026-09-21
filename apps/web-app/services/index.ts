import { mockVenueConfig, uiConfig as _uiConfig } from "@/booking.config";
import type { BookingService } from "./bookingService";
import { HttpBookingService } from "./httpBookingService";
import { MockBookingService } from "./mockBookingService";

/**
 * Single source of truth for which service implementation is in use.
 *
 *   VITE_USE_MOCK=true (default)            → MockBookingService (deterministic demo data)
 *   VITE_USE_MOCK=false + VITE_API_BASE_URL → HttpBookingService (real API)
 *
 * Env vars are read as PRIORITY_NAME (`NEXT_PUBLIC_*`) first for Next.js and
 * fall back to the Vite-style `VITE_*` names so the documented `.env.example`
 * (VITE_API_BASE_URL= / VITE_USE_MOCK=) works either way.
 */
function readEnv(key: "VITE_API_BASE_URL" | "VITE_USE_MOCK"): string | undefined {
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
    const viteValue = meta.env?.[key];
    if (viteValue !== undefined) return viteValue;
  } catch {
    // import.meta.env not available (SSR/prerender) — fall through.
  }
  // Static member access so Next.js inlines these at build time.
  if (key === "VITE_API_BASE_URL") return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (key === "VITE_USE_MOCK") return process.env.NEXT_PUBLIC_USE_MOCK;
  return undefined;
}

const useMock = (readEnv("VITE_USE_MOCK") ?? "true") !== "false";
const apiBaseUrl = readEnv("VITE_API_BASE_URL") ?? "";

export const bookingService: BookingService = useMock
  ? new MockBookingService(mockVenueConfig)
  : new HttpBookingService(apiBaseUrl);

let mockServiceForTesting: MockBookingService | undefined;
if (bookingService instanceof MockBookingService) {
  mockServiceForTesting = bookingService;
}

/** Dev-only: force the next createHold to throw SLOT_CONFLICT ("2 slots taken"). */
export function setMockConflictMode(enabled: boolean) {
  mockServiceForTesting?.setForceConflict(enabled);
}

export const uiConfig = _uiConfig;