import type {
  AvailabilityResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreateHoldRequest,
  CreateHoldResponse,
  ISODate,
  VenueConfig,
  Voucher,
  VoucherContext,
} from "@/types/booking";
import { ApiError } from "@/types/booking";
import type { BookingService } from "./bookingService";

/**
 * Deterministic mock of the backend so the whole flow works without a server.
 * - 300–600ms simulated latency on every call.
 * - Deterministic "booked" cells from a stable hash of each slot identity.
 * - A dev toggle (module flag or localStorage `pp:mockConflict`) that forces
 *   createHold to throw SLOT_CONFLICT so conflict handling can be tested.
 */
export class MockBookingService implements BookingService {
  constructor(private readonly config: VenueConfig) {}

  private forceConflict = false;

  /** Dev toggle: make the next createHold throw SLOT_CONFLICT. */
  setForceConflict(value: boolean) {
    this.forceConflict = value;
  }

  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));
  }

  private conflictMode(): boolean {
    if (this.forceConflict) return true;
    try {
      const val =
        typeof localStorage !== "undefined" ? localStorage.getItem("pp:mockConflict") : null;
      return val === "1" || val === "true";
    } catch {
      return false;
    }
  }

  async getVenueConfig(): Promise<VenueConfig> {
    await this.simulateLatency();
    return this.config;
  }

  async getAvailability(from: ISODate, to: ISODate): Promise<AvailabilityResponse> {
    await this.simulateLatency();
    return {
      serverTime: new Date().toISOString(),
      from,
      to,
      unavailable: this.generateUnavailable(from, to),
    };
  }

  private generateUnavailable(
    from: ISODate,
    to: ISODate
  ): AvailabilityResponse["unavailable"] {
    const unavailable: AvailabilityResponse["unavailable"] = [];
    const step = 86_400_000;
    const startMs = Date.parse(`${from}T12:00:00Z`);
    const endMs = Date.parse(`${to}T12:00:00Z`);
    for (let ms = startMs; ms <= endMs; ms += step) {
      const day = new Date(ms).toISOString().slice(0, 10);
      const reasons: AvailabilityResponse["unavailable"][number]["reason"][] = [
        "booked",
        "held",
      ];
      for (const court of this.config.courts) {
        for (let h = this.config.openHour; h < this.config.closeHour; h += 1) {
          const start = this.slotISO(day, h);
          const rnd = hash01(`${day}|${start}|${court.id}`);
          if (rnd < 0.3) {
            const reason = reasons[Math.floor(hash01(`${day}|${court.id}|r`) * reasons.length)];
            // "blocked" is reserved for a maintenance window, e.g. 2 AM.
            const blocked = hash01(`${day}|b`) > 0.95;
            unavailable.push({
              courtId: court.id,
              start,
              reason: blocked ? "blocked" : reason,
            });
          }
        }
      }
    }
    return unavailable;
  }

  private slotISO(day: string, hour: number): string {
    const [y, m, d] = day.split("-").map(Number);
    const offset = this.config.timezone === "Asia/Manila" ? "+08:00" : "+00:00";
    const instant = hour >= 24 ? new Date(Date.UTC(y, m - 1, d + 1, hour - 24, 0, 0)) : new Date(Date.UTC(y, m - 1, d, hour, 0, 0));
    const iso = instant.toISOString().slice(0, 19);
    return `${iso}${offset}`;
  }

  async createHold(req: CreateHoldRequest): Promise<CreateHoldResponse> {
    await this.simulateLatency();
    if (this.conflictMode()) {
      throw new ApiError(
        "SLOT_CONFLICT",
        409,
        "Some slots were just taken.",
        req.slots.slice(0, 2)
      );
    }
    this.validate(req.slots);

    const byId = new Map(this.config.courts.map((c) => [c.id, c]));
    const items = req.slots.map((slot) => {
      const court = byId.get(slot.courtId);
      const priceMinor = (court?.hourlyRateMinor ?? 0) * (this.config.slotMinutes / 60);
      return {
        courtId: slot.courtId,
        start: slot.start,
        end: this.endOf(slot.start),
        priceMinor,
      };
    });
    return {
      holdId: `hold_${randId()}`,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      items,
      totalMinor: items.reduce((s, i) => s + i.priceMinor, 0),
      currency: this.config.currency.code,
    };
  }

  async releaseHold(): Promise<void> {
    await this.simulateLatency();
    return undefined;
  }

  async validateVoucher(code: string, ctx: VoucherContext): Promise<Voucher | null> {
    await this.simulateLatency();
    const normalized = (code ?? "").trim().toUpperCase();
    if (normalized === "PP10") {
      return {
        code: normalized,
        label: "10% off",
        discountMinor: Math.min(ctx.amountMinor, Math.round(ctx.amountMinor * 0.1)),
      };
    }
    if (normalized === "WELCOME") {
      return {
        code: normalized,
        label: "Flat ₱100 off",
        discountMinor: Math.min(ctx.amountMinor, 100 * 100),
      };
    }
    return null;
  }

  async checkout(req: CheckoutRequest): Promise<CheckoutResponse> {
    await this.simulateLatency();
    if (!req.holdId) {
      throw new ApiError("VALIDATION", 400, "Missing holdId.");
    }
    // Real backend: PayMongo creates a payment link whose success_url points at
    // <successUrl>?bookingId=… and returns the link + its QR image. There is no
    // PayMongo in the mock, so the "payment link" IS the success URL itself —
    // following the QR/link lands straight on the confirmation page, exactly
    // like PayMongo's redirect-callback would.
    const bookingId = `bk_${randId()}`;
    const base =
      req.successUrl && req.successUrl.trim() !== ""
        ? req.successUrl
        : `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/checkout/success`;
    const successUrl = `${base}${base.includes("?") ? "&" : "?"}bookingId=${bookingId}`;
    return {
      bookingId,
      status: "pending_payment",
      paymentUrl: successUrl,
      qrCodeUrl: qrSvgDataUrl(successUrl),
      successUrl,
    };
  }

  private validate(slots: CreateHoldRequest["slots"]) {
    const byId = new Set(this.config.courts.map((c) => c.id));
    for (const slot of slots) {
      if (!byId.has(slot.courtId)) {
        throw new ApiError("VALIDATION", 400, `Unknown court ${slot.courtId}.`);
      }
    }
  }

  private endOf(start: string): string {
    const end = new Date(new Date(start).getTime() + this.config.slotMinutes * 60_000);
    return `${end.toISOString().slice(0, 19)}${start.slice(19) || "+00:00"}`;
  }
}

function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h >>>= 0;
  return (h % 1000) / 1000;
}

function randId() {
  try {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}

/**
 * Fictional QR stand-in: a deterministic QR-look SVG data URL derived from the
 * payment URL, so the scan-to-pay modal renders without a real PayMongo link.
 * The production backend returns the actual QR image in qrCodeUrl.
 */
function qrSvgDataUrl(value: string): string {
  const size = 21;
  let seed = 2166136261;
  for (let i = 0; i < value.length; i++) {
    seed ^= value.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    seed = Math.imul(seed ^ (seed >>> 13), 0x5bd1e995);
    seed = (seed ^ (seed >>> 15)) >>> 0;
    cells.push((seed & 1) === 1);
  }
  const inFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const finderCell = (r: number, c: number) => {
    const rr = r < 7 ? r : r - (size - 7);
    const cc = c < 7 ? c : c - (size - 7);
    return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
  };
  let modules = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const on = inFinder(r, c) ? finderCell(r, c) : cells[r * size + c];
      if (on) modules += `<rect x="${c}" y="${r}" width="1" height="1"/>`;
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="100%" height="100%" fill="#ffffff"/>` +
    `<g fill="#0e4a3f">${modules}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}