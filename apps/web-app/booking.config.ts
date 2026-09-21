import type { VenueConfig } from "@/types/booking";

export const uiConfig = {
  weekStartsOn: 1, // Monday
  hidePastSlots: true, // true = past rows/days removed; false = shown as disabled "Past" cells
  availabilityRefetchMs: 30000,
};

// Mock venue config. Shape mirrors `GET /venue` so switching to the real API
// only requires VITE_USE_MOCK=false + VITE_API_BASE_URL (see services/index.ts).
export const mockVenueConfig: VenueConfig = {
  venueId: "paddlepit-davao",
  venueName: "PaddlePit",
  timezone: "Asia/Manila",
  currency: { symbol: "₱", code: "PHP", minorUnit: 100 },
  openHour: 0,
  closeHour: 24, // 12 AM to 12 AM (all 24 hourly slots: 12 AM–1 AM … 11 PM–12 AM)
  slotMinutes: 60,
  maxAdvanceDays: 30,
  courts: [
    { id: "court-1", name: "Court 1", hourlyRateMinor: 35000 }, // ₱350.00
    { id: "court-2", name: "Court 2", hourlyRateMinor: 35000 },
    { id: "court-3", name: "Court 3", hourlyRateMinor: 40000 }, // ₱400.00
  ],
};