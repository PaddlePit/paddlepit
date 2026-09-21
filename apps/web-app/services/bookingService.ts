import type {
  AvailabilityResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreateHoldRequest,
  CreateHoldResponse,
  ISODate,
  VenueConfig,
} from "@/types/booking";

/**
 * The ONLY interface components/hooks depend on for backend data. A real API
 * can replace the mock by changing a single file (services/index.ts) and env
 * variables — nothing downstream needs to change.
 */
export interface BookingService {
  /** GET /venue */
  getVenueConfig(): Promise<VenueConfig>;
  /** GET /availability?from=&to= */
  getAvailability(from: ISODate, to: ISODate): Promise<AvailabilityResponse>;
  /** POST /holds — reserves the requested slots for ~10 minutes. */
  createHold(req: CreateHoldRequest): Promise<CreateHoldResponse>;
  /** DELETE /holds/:id — abandons a hold. */
  releaseHold(holdId: string): Promise<void>;
  /** POST /checkout — confirms the held booking (idempotent via idempotencyKey). */
  checkout(req: CheckoutRequest, idempotencyKey: string): Promise<CheckoutResponse>;
}