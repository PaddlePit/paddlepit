# Payment Module

Handles all payment-related operations and PayMongo webhook integration.

## Directory Structure

```
api/payment/
├── __init__.py
├── README.md (this file)
├── webhook.py      # POST /webhook/paymongo
└── status.py       # GET /payment/status/{booking_id}
```

## Endpoints

### `POST /webhook/paymongo`
**File:** `webhook.py`

Receives and processes PayMongo webhook events.

**Supported Events:**
- `payment.succeeded` — Payment completed successfully
- `payment.failed` — Payment failed/declined
- `payment_intent.processing` — Payment still processing

**Payload:**
```json
{
  "type": "payment.succeeded",
  "data": {
    "id": "pi_xxx",
    "attributes": {
      "status": "succeeded",
      "amount": 70000,
      "metadata": {
        "booking_id": "xxx",
        "email": "user@email.com"
      }
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment recorded successfully",
  "booking_id": "xxx",
  "payment_id": "pi_xxx",
  "transaction_status": "paid"
}
```

### `GET /payment/status/{booking_id}`
**File:** `status.py`

Check payment status for a specific booking without waiting for webhook.

**Path Parameters:**
- `booking_id` (string): The booking ID to check

**Response (Found):**
```json
{
  "booking_id": "xxx",
  "status": "paid",
  "payment_id": "pi_xxx",
  "amount": 70000
}
```

**Response (Not Found):**
```json
{
  "booking_id": "xxx",
  "status": "not_found",
  "message": "No transaction found for this booking"
}
```

## Utilities

Helper functions are in `api/utils/webhook_helpers.py`:

- `verify_paymongo_signature()` — Verify webhook authenticity
- `handle_payment_succeeded()` — Process successful payments
- `handle_payment_failed()` — Process failed payments
- `handle_payment_processing()` — Track payment progress
- `get_payment_status()` — Query payment status

## Security

- All webhooks are verified using HMAC-SHA256 signature
- Signature verification is mandatory for all incoming webhooks
- PayMongo signing secret is read from environment variables

## Configuration

Required environment variables in `.env`:

```
PAYMONGO_SECRET_KEY=sk_test_xxx
PAYMONGO_PUBLIC_KEY=pk_test_xxx
PAYMONGO_WEBHOOK_SECRET=whsec_test_xxx
```

## Integration with Bookings

When a booking is created:
1. `POST /booking` creates booking and payment intent
2. Frontend receives `client_key` to complete payment
3. PayMongo sends webhook when payment completes
4. `POST /webhook/paymongo` updates transaction status
5. Frontend can optionally poll `GET /payment/status/{booking_id}`

## TODO

- [ ] Persist transactions to database instead of in-memory store
- [ ] Implement email confirmations for successful payments
- [ ] Add payment failure notifications
- [ ] Implement refund processing endpoint
- [ ] Add payment retry logic
