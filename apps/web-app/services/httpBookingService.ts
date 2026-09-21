import type {
  AvailabilityResponse,
  CheckoutRequest,
  CheckoutResponse,
  CreateHoldRequest,
  CreateHoldResponse,
  ISODate,
  VenueConfig,
} from "@/types/booking";
import { createApiClient, type ApiClient, type AuthTokenProvider } from "./apiClient";
import type { BookingService } from "./bookingService";

/**
 * Real HTTP implementation against VITE_API_BASE_URL. Wiring is complete
 * (URLs, methods, JSON bodies, idempotency header, status→ApiError mapping) so
 * switching to it only requires VITE_USE_MOCK=false.
 */
export class HttpBookingService implements BookingService {
  private readonly client: ApiClient;

  constructor(baseUrl: string, getToken?: AuthTokenProvider) {
    const normalized = baseUrl.replace(/\/+$/, "");
    this.client = createApiClient(normalized, getToken);
  }

  async getVenueConfig(): Promise<VenueConfig> {
    return this.client.get<VenueConfig>("/venue");
  }

  async getAvailability(from: ISODate, to: ISODate): Promise<AvailabilityResponse> {
    return this.client.get<AvailabilityResponse>(
      `/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
  }

  async createHold(req: CreateHoldRequest): Promise<CreateHoldResponse> {
    return this.client.post<CreateHoldResponse>("/holds", { body: req });
  }

  async releaseHold(holdId: string): Promise<void> {
    await this.client.delete<void>(`/holds/${encodeURIComponent(holdId)}`);
  }

  async checkout(req: CheckoutRequest, idempotencyKey: string): Promise<CheckoutResponse> {
    return this.client.post<CheckoutResponse>("/checkout", {
      body: req,
      headers: { "Idempotency-Key": idempotencyKey },
    });
  }
}