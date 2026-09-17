# Booking Utilities

Helper functions for booking creation and management. Each function has its own file for maintainability.

## Directory Structure

```
utils/booking/
├── __init__.py
├── README.md (this file)
├── calculate_duration.py    # Duration calculation
├── calculate_price.py       # Price calculation
└── process_payment.py       # Payment processing
```

## Functions

### `calculate_duration.py`
**`calculate_booking_duration_hours(start_time, end_time) -> float`**

Calculate the duration between two times in hours.

```python
from api.utils.booking import calculate_booking_duration_hours
from datetime import datetime

start = datetime(2026, 9, 9, 10, 0, 0)
end = datetime(2026, 9, 9, 12, 0, 0)
hours = calculate_booking_duration_hours(start, end)  # 2.0
```

### `calculate_price.py`
**`calculate_booking_price(booking_items) -> float`**

Calculate total booking price based on court rates and duration.

```python
from api.utils.booking import calculate_booking_price

booking_items = [
    BookingItem(court_id="court-1", start_time=start, end_time=end),
    BookingItem(court_id="court-2", start_time=start, end_time=end)
]
total_price = calculate_booking_price(booking_items)  # 1000.0
```

**`get_court_rate(court_id) -> int`**

Get hourly rate for a specific court.

```python
from api.utils.booking import get_court_rate

rate = get_court_rate("court-1")  # 250 (pesos per hour)
```

### `process_payment.py`
**`process_paymongo_payment(amount_centavos, booking_id, email) -> dict`**

Process payment through PayMongo Payments API.

```python
from api.utils.booking import process_paymongo_payment

result = process_paymongo_payment(50000, "booking-123", "user@example.com")
if result["success"]:
    payment_id = result["payment_intent_id"]
    client_key = result["client_key"]
else:
    error = result["error"]
```

## Integration Example

```python
# In create_booking endpoint
from api.utils.booking import (
    calculate_booking_price,
    process_paymongo_payment,
)

# Calculate price
total_price = calculate_booking_price(booking_items)

# Apply discount
if promo_code:
    discount = apply_promo(promo_code)
    total_price -= discount

# Process payment
amount_centavos = int(total_price * 100)
payment_result = process_paymongo_payment(
    amount_centavos,
    booking_id,
    email
)
```

## Court Rates

Default rates (can be modified in `calculate_price.py`):
- Court 1: ₱250/hour
- Court 2: ₱250/hour
- Court 3: ₱250/hour

## Error Handling

All functions raise `ValueError` for invalid inputs:

```python
try:
    calculate_booking_price(invalid_items)
except ValueError as e:
    print(f"Invalid booking: {e}")  # Invalid court ID: court-5
```

Payment function returns error dict instead of raising:

```python
result = process_paymongo_payment(amount, booking_id, email)
if not result["success"]:
    error = result["error"]  # "PayMongo error: ..."
```
