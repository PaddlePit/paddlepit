# PaddlePit API Reference

---

## GET /
```json
{
  "message": "Welcome to the Root API"
}
```

---

## GET /health
```json
{
  "status": "ok"
}
```

---

## GET /booking
Returns array of all bookings.

```json
[
  {
    "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
    "booker_name": "John Doe",
    "phone": "+63-9175551234",
    "email": "john.doe@email.com",
    "courts_reserved": 2,
    "total_price": 90.00,
    "created_at": "2026-09-05T15:30:00"
  }
]
```

---

## GET /booking/{transaction_id}
Returns specific booking details with formatted dates.

**Path Parameters:**
- `transaction_id` (str): Public transaction ID

```json
{
  "public_transaction_id": "1001",
  "email": "john.doe@email.com",
  "status": "confirmed",
  "bookings": [
    {
      "court_name": "Court 1 - North Wing",
      "date": "2026-09-05",
      "start_time": "15:30",
      "end_time": "16:30"
    }
  ]
}
```

---

## GET /availability
Returns all court availability from today onwards.

```json
{
  "date_range": {
    "start_date": "2026-09-09",
    "end_date": "2026-12-31"
  },
  "courts": [
    {
      "id": "court-1",
      "name": "Court 1",
      "hourly_rate": 250
    },
    {
      "id": "court-2",
      "name": "Court 2",
      "hourly_rate": 250
    },
    {
      "id": "court-3",
      "name": "Court 3",
      "hourly_rate": 250
    }
  ],
  "availability": [
    {
      "date": "2026-09-09",
      "day": "WED",
      "court_id": "court-1",
      "time_slot": "06:00-07:00",
      "status": "booked"
    },
    {
      "date": "2026-09-09",
      "day": "WED",
      "court_id": "court-2",
      "time_slot": "06:00-07:00",
      "status": "available"
    }
  ]
}
```

---

## POST /booking
Creates a new booking and processes payment through PayMongo.

**Request:**
```json
{
  "booker_name": "Juan Dela Cruz",
  "email": "juan@email.com",
  "phone": "+63-9175558899",
  "booking_items": [
    {
      "court_id": "court-2",
      "start_time": "2026-09-09T10:00:00",
      "end_time": "2026-09-09T12:00:00"
    }
  ],
  "promo_code": "PROMO20"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Booking created and payment processed successfully",
  "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
  "transaction_id": "TXN3A7F2D1E",
  "paymongo_transaction_id": "pi_1234567890abcdef",
  "booker_name": "Juan Dela Cruz",
  "email": "juan@email.com",
  "total_price": 400.0,
  "discount_amount": 100.0,
  "booking_items": [
    {
      "court_id": "court-2",
      "start_time": "2026-09-09T10:00:00",
      "end_time": "2026-09-09T12:00:00",
      "price": 500.0
    }
  ],
  "payment_status": "succeeded"
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "message": "Payment processing failed",
  "error": "Insufficient funds",
  "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
  "transaction_id": "TXN3A7F2D1E"
}
```

---

## GET /promo/{code}
Validates a promo code and returns discount amount if valid.

**Path Parameters:**
- `code` (str): Promo code to validate

**Response (Valid):**
```json
{
  "valid": true,
  "coupon_code": "PROMO20",
  "discount_amount": 100
}
```

**Response (Invalid):**
```json
{
  "detail": "Promo code 'INVALID123' not found"
}
```

---

## POST /webhook/paymongo
Receives payment status updates from PayMongo. Automatically updates transaction status.

**Triggered by PayMongo for events:**
- `payment.succeeded` — Payment completed
- `payment.failed` — Payment failed
- `payment_intent.processing` — Payment processing

**Webhook Event Payload:**
```json
{
  "type": "payment.succeeded",
  "data": {
    "id": "pi_1234567890abcdef",
    "attributes": {
      "status": "succeeded",
      "amount": 70000,
      "metadata": {
        "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
        "email": "juan@email.com"
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
  "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
  "payment_id": "pi_1234567890abcdef",
  "transaction_status": "paid"
}
```

---

## GET /payment/status/{booking_id}
Check payment status for a specific booking.

**Path Parameters:**
- `booking_id` (str): Booking ID to check status for

**Response (Paid):**
```json
{
  "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
  "status": "paid",
  "payment_id": "pi_1234567890abcdef",
  "amount": 70000
}
```

**Response (Not Found):**
```json
{
  "booking_id": "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c",
  "status": "not_found",
  "message": "No transaction found for this booking"
}
```

---
