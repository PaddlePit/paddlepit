# Payment Utilities

Helper functions for PayMongo webhook processing and payment status tracking. Each function has its own file for maintainability.

## Directory Structure

```
utils/payment/
├── __init__.py
├── README.md (this file)
├── store.py                 # Transaction storage
├── verify_signature.py       # Webhook signature verification
├── handle_succeeded.py       # Payment success handler
├── handle_failed.py          # Payment failure handler
├── handle_processing.py      # Payment processing handler
└── status.py                 # Payment status query
```

## Functions

### `store.py`
**Transaction storage (in-memory, TODO: replace with database)**

```python
from api.utils.payment.store import (
    get_transaction,
    set_transaction,
    transaction_exists
)

# Store transaction
set_transaction("booking-123", {
    "status": "paid",
    "paymongo_id": "pi_xxx",
    "amount": 50000,
    "email": "user@example.com"
})

# Retrieve transaction
transaction = get_transaction("booking-123")

# Check if exists
if transaction_exists("booking-123"):
    print("Transaction found")
```

### `verify_signature.py`
**Verify PayMongo webhook authenticity**

```python
from api.utils.payment import verify_paymongo_signature

is_valid = verify_paymongo_signature(request_body, signature_header)
if is_valid:
    print("Webhook is from PayMongo")
else:
    print("Invalid signature - webhook may be compromised")
```

### `handle_succeeded.py`
**Process successful payment**

```python
from api.utils.payment import handle_payment_succeeded

result = handle_payment_succeeded(
    payment_id="pi_xxx",
    booking_id="booking-123",
    amount=50000,
    email="user@example.com"
)
# Returns: {"status": "success", "message": "...", "transaction_status": "paid"}
```

### `handle_failed.py`
**Process failed payment**

```python
from api.utils.payment import handle_payment_failed

result = handle_payment_failed(
    payment_id="pi_xxx",
    booking_id="booking-123",
    email="user@example.com"
)
# Returns: {"status": "recorded", "transaction_status": "failed"}
```

### `handle_processing.py`
**Track payment in progress (awaiting customer action)**

```python
from api.utils.payment import handle_payment_processing

result = handle_payment_processing(
    payment_id="pi_xxx",
    booking_id="booking-123"
)
# Returns: {"status": "acknowledged", "message": "Payment is processing"}
```

### `status.py`
**Query payment status**

```python
from api.utils.payment import get_payment_status

status = get_payment_status("booking-123")
# Returns: {"booking_id": "...", "status": "paid", "payment_id": "...", "amount": ...}
# Or: {"booking_id": "...", "status": "not_found", "message": "..."}
```

## Webhook Integration

The webhook endpoint uses these utilities:

```python
# api/payment/webhook.py
from fastapi import Request
from api.utils.payment import (
    verify_paymongo_signature,
    handle_payment_succeeded,
    handle_payment_failed,
    handle_payment_processing,
)

@router.post("/webhook/paymongo")
async def webhook_paymongo(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Paymongo-Signature")
    
    # Verify signature
    if not verify_paymongo_signature(body, signature):
        raise HTTPException(status_code=401)
    
    payload = await request.json()
    event_type = payload.get("type")
    
    # Route to handler
    if event_type == "payment.succeeded":
        return handle_payment_succeeded(...)
    elif event_type == "payment.failed":
        return handle_payment_failed(...)
    elif event_type == "payment_intent.processing":
        return handle_payment_processing(...)
```

## Transaction Store

Currently uses in-memory dictionary:
```python
TRANSACTIONS = {
    "booking-id": {
        "status": "paid",
        "paymongo_id": "pi_xxx",
        "amount": 50000,
        "email": "user@example.com"
    }
}
```

**TODO:** Replace with database queries to `TransactionDetail` table when database is ready.

## Error Handling

All handlers catch exceptions and raise `HTTPException`:

```python
try:
    result = handle_payment_succeeded(...)
except HTTPException as e:
    # Returns HTTP 500 with error detail
    raise e
```

Status query returns not_found dict instead of raising:

```python
status = get_payment_status("unknown-booking")
# Returns: {"status": "not_found", "message": "..."}
```

## Verification

Signature verification uses HMAC-SHA256 with constant-time comparison to prevent timing attacks:

- Computes expected signature: `HMAC(secret_key, request_body, SHA256)`
- Compares with provided signature: `constant_time_compare(expected, provided)`
- Returns True if match, False if mismatch or error
