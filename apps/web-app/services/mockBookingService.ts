import type {
  AvailabilityResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreateHoldRequest,
  CreateHoldResponse,
  ISODate,
  VenueConfig,
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

  async checkout(req: CheckoutRequest): Promise<CheckoutResponse> {
    await this.simulateLatency();
    if (!req.holdId) {
      throw new ApiError("VALIDATION", 400, "Missing holdId.");
    }
    return { bookingId: `bk_${randId()}`, status: "confirmed" };
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