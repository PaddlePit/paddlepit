export type ISODateTime = string; // ISO 8601 with offset, e.g. "2026-08-06T17:00:00+08:00"
export type ISODate = string; // business date "2026-08-06"

export interface Court {
  id: string;
  name: string;
  hourlyRateMinor: number; // integer minor units: 35000 = ₱350.00 (never floats)
}

export interface VenueConfig {
  venueId: string;
  venueName: string;
  timezone: string; // IANA, e.g. "Asia/Manila"
  currency: { symbol: string; code: string; minorUnit: number }; // PHP, 100
  openHour: number; // 24h clock, e.g. 6
  closeHour: number; // last slot ENDS here. 25 = 1 AM next day (overnight supported)
  slotMinutes: number; // 60
  maxAdvanceDays: number; // 30
  courts: Court[];
}

// A slot's identity; end = start + slotMinutes
export interface SlotRef {
  courtId: string;
  start: ISODateTime;
}

export interface AvailabilityResponse {
  serverTime: ISODateTime; // server is the source of truth for "now"
  from: ISODate;
  to: ISODate;
  unavailable: Array<SlotRef & { reason: "booked" | "held" | "blocked" }>;
}

export interface CreateHoldRequest {
  slots: SlotRef[];
}

export interface HoldItem {
  courtId: string;
  start: ISODateTime;
  end: ISODateTime;
  priceMinor: number;
}

export interface CreateHoldResponse {
  holdId: string;
  expiresAt: ISODateTime;
  items: HoldItem[];
  totalMinor: number;
  currency: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface Voucher {
  code: string;
  label: string;
  discountMinor: number; // amount off in minor units, already capped at the total
}

export interface VoucherContext {
  amountMinor: number;
  currency: string;
}

export interface CheckoutRequest {
  holdId: string;
  customer: CustomerInfo;
  voucherCode?: string;
  /** Base URL PayMongo redirects to after payment; the backend appends the booking id. */
  successUrl?: string;
}

export interface CheckoutResponse {
  bookingId: string;
  status: "pending_payment" | "confirmed";
  paymentUrl?: string; // PayMongo payment link
  qrCodeUrl?: string; // PayMongo QR code image for the payment link
  successUrl?: string; // resolved callback target (success_url) for the payment link
  clientSecret?: string;
}

export type ApiErrorCode =
  | "SLOT_CONFLICT"
  | "HOLD_EXPIRED"
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "NETWORK"
  | "UNKNOWN";

const API_ERROR_CODES: ApiErrorCode[] = [
  "SLOT_CONFLICT",
  "HOLD_EXPIRED",
  "VALIDATION",
  "UNAUTHORIZED",
  "NETWORK",
  "UNKNOWN",
];

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  conflicts?: SlotRef[];

  constructor(
    code: ApiErrorCode,
    status: number,
    message: string,
    conflicts?: SlotRef[]
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.conflicts = conflicts;
  }

  static fromPayload(status: number, payload: unknown): ApiError {
    const body = (payload ?? {}) as {
      code?: string;
      message?: string;
      conflicts?: SlotRef[];
    };
    const code = API_ERROR_CODES.includes(body.code as ApiErrorCode)
      ? (body.code as ApiErrorCode)
      : status === 409
        ? "SLOT_CONFLICT"
        : status === 410
          ? "HOLD_EXPIRED"
          : status === 401
            ? "UNAUTHORIZED"
            : status >= 400 && status < 500
              ? "VALIDATION"
              : "UNKNOWN";
    return new ApiError(
      code,
      status,
      body.message ?? (code === "VALIDATION" ? "Invalid request." : "Something went wrong."),
      Array.isArray(body.conflicts) ? body.conflicts : undefined
    );
  }

  static network(): ApiError {
    return new ApiError(
      "NETWORK",
      0,
      "Could not reach the booking service. Check your connection and try again."
    );
  }
}