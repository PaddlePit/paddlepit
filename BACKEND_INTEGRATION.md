# PaddlePit Booking API — Frontend Integration Contract

The web app has ONE booking service interface (`apps/web-app/services/bookingService.ts`), two implementations, and a flip-switch between them:

| Implementation | File | When it runs |
| --- | --- | --- |
| `MockBookingService` | `apps/web-app/services/mockBookingService.ts` | `VITE_USE_MOCK=true` (default) |
| `HttpBookingService` | `apps/web-app/services/httpBookingService.ts` | `VITE_USE_MOCK=false` + `VITE_API_BASE_URL` |

The mock is deterministic (FNV hash of slot → ~30% booked), has forced-conflict tooling (`setMockConflictMode(true)` or `localStorage["pp:mockConflict"]="1"`), and mimics server latency — no backend needed to develop the UI.

> The frontend ENTIRELY mirrors the backend contract below. Do not rename/retype DTOs on the backend — the frontend reads them literally from the JSON bodies.
>
> Endpoint paths are the DEFAULT contract; adjust `httpBookingService.ts` if the real deployment differs.

## Conventions

- **Base URL**: `VITE_API_BASE_URL` (documented in `apps/web-app/.env.example`), e.g. `https://api.paddlepit.ph/v1`. Trailing slashes are stripped.
- **Time**: all timestamps are ISO 8601 **with offset**, always in the venue timezone — e.g. `2026-08-06T17:00:00+08:00` (`Asia/Manila`, fixed +08:00, no DST). The server is the single source of truth for "now" (`serverTime`); the client never computes past-ness from its own clock.
- **Business date**: `ISODate` = local calendar date `2026-08-06`. Overnight hours are supported: `closeHour: 25` means the last slot ENDS at 1:00 AM the next calendar day, and that slot belongs to the PREVIOUS business date.
- **Money**: integer **minor units only** (never floats). `hourlyRateMinor: 35000` = ₱350.00. Currency is `PHP`, `minorUnit: 100`. The client formats `formatMoney(minor, currency)` and never uses decimals when whole.
- **Idempotency**: `checkout` must be safe to retry — the client sends a fresh UUID in `Idempotency-Key` per user submit; replaying it must return the original result, not double-charge.
- **Auth**: optional `Authorization: Bearer` token via an injected token provider; the mock path has no auth.

## Endpoints

### `GET /venue` → `VenueConfig`

Venue + courts + pricing. Courts are the 1:N BookingItem target list.

```json
{
  "venueId": "paddlepit",
  "venueName": "PaddlePit",
  "timezone": "Asia/Manila",
  "currency": { "symbol": "₱", "code": "PHP", "minorUnit": 100 },
  "openHour": 0,
  "closeHour": 24,
  "slotMinutes": 60,
  "maxAdvanceDays": 30,
  "courts": [
    { "id": "court-1", "name": "Court 1", "hourlyRateMinor": 35000 },
    { "id": "court-2", "name": "Court 2", "hourlyRateMinor": 35000 },
    { "id": "court-3", "name": "Court 3", "hourlyRateMinor": 40000 }
  ]
}
```

### `GET /availability?from=<ISODate>&to=<ISODate>` → `AvailabilityResponse`

One request covers the whole visible week (no per-cell calls).

```json
{
  "serverTime": "2026-08-06T09:15:00+08:00",
  "from": "2026-08-03",
  "to": "2026-08-09",
  "unavailable": [
    { "courtId": "court-1", "start": "2026-08-06T17:00:00+08:00", "reason": "booked" }
  ]
}
```

`reason` ∈ `booked | held | blocked`. The client builds a lookup from these; anything not in `unavailable` is available to select. (For reference: the mock derives `booked` from a hash, so exactly the same dates/courts are unavailable on every reload — useful for screenshots.)

### `POST /holds` `{ slots: SlotRef[] }` → `CreateHoldResponse`

Slots are `[{ "courtId": "court-1", "start": "2026-08-06T17:00:00+08:00" }]` (end = start + slotMinutes). A hold reserves the slots for a few minutes so checkout can't race.

```json
{
  "holdId": "hld_8f2…",
  "expiresAt": "2026-08-06T09:20:00+08:00",
  "items": [
    {
      "courtId": "court-1",
      "start": "2026-08-06T17:00:00+08:00",
      "end": "2026-08-06T18:00:00+08:00",
      "priceMinor": 35000
    }
  ],
  "totalMinor": 35000,
  "currency": "PHP"
}
```

Server-returned prices (after promos/rate changes) REPLACE the client estimate in the breakdown sheet.

**409 Conflict** → `ApiError` with code `SLOT_CONFLICT` and the taken slots in `conflicts: SlotRef[]`. The client removes exactly those slots from the selection, greys them out as just-taken, and refetches.

### `DELETE /holds/{holdId}` → 204

Releases a hold when the user dismisses or succeeds early (best-effort; holds also expire server-side via `expiresAt`). The checkout page guards "Back to booking" with a warning dialog that makes the impact explicit: releasing stops the hold countdown and re-opens the slots to other players.

### `POST /vouchers/validate` `{ code, amountMinor, currency }` → `Voucher` | 404/422 → null

Validates a promo/voucher code against the booking total. `amountMinor` is the pre-discount total so percentage codes resolve server-side (authoritative pricing).

```json
{ "code": "PP10", "label": "10% off", "discountMinor": 3500 }
```

- `404` or `422` → the code is invalid; the client clears the field and shows "That voucher code isn't valid."
- The client reduces the displayed total by `discountMinor` (floored at 0) and re-sends `voucherCode` on checkout so the server applies the same discount authoritatively.

### `POST /checkout` `{ holdId, customer, voucherCode?, successUrl? }` + `Idempotency-Key` header → `CheckoutResponse`

```json
{
  "bookingId": "bk_9c1…",
  "status": "pending_payment",
  "paymentUrl": "https://checkout.paymongo.com/pp_…",
  "qrCodeUrl": "https://api.paymongo.com/qr/pp_….png",
  "successUrl": "https://paddlepit.ph/checkout/success?bookingId=bk_9c1…"
}
```

`status`:
- `pending_payment` with `paymentUrl` (+ `qrCodeUrl`) → the client opens a **scan-to-pay modal**: the QR image, a tappable link back to `paymentUrl`, and an info note. There is **no "payment complete" button** — confirmation is signaled only by the PayMongo callback: the backend sets the link's `success_url` to `<successUrl>?bookingId=…` (built from the client-supplied base URL), and after a successful payment PayMongo redirects the customer there. The client's `/checkout/success` static page renders the confirmation from the redirected `bookingId`. The webhook/frontend never asserts payment itself.
- `pending_payment` with `clientSecret` → client hands off to the PayMongo SDK (future work; currently a placeholder toast).
- `confirmed` → success screen with `bookingId`.

The modal reuses the same `Idempotency-Key` on retry, so re-opening it can't re-charge.

**410 Gone** → `HOLD_EXPIRED`: selection is preserved, the user is told to create a new hold.

## Error envelope

The client's `apiClient.ts` maps HTTP → `ApiError` (`code`, `status`, `conflicts`). Suggested backend shape:

```json
{ "code": "SLOT_CONFLICT", "message": "One or more slots were just taken.", "conflicts": [ ... ] }
```

- `409` → `SLOT_CONFLICT` (include `conflicts`)
- `410` → `HOLD_EXPIRED`
- `401` → `UNAUTHORIZED`
- other 4xx → `VALIDATION`
- no response → `NETWORK`

## Switching from mock to real API

1. Set in `apps/web-app/.env` (see `.env.example`):
   ```
   VITE_API_BASE_URL=https://api.paddlepit.ph/v1
   VITE_USE_MOCK=false
   ```
   (For `next build`/preview, the `NEXT_PUBLIC_*` variants are inlined instead.)
2. Nothing else. UI, hooks, and error flows are identical for both implementations.

## Data model alignment

`Booking` 1:N `BookingItem` N:1 `Court`. One booking may span 1–3 courts in the same time window; that window is held/checked out as a single unit and appears as one row of items in the hold response (see `items`). Court utilization is computed from `BookingItem` records — no separate table.