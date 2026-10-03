# Validation Utilities

Input validation functions to ensure data integrity and security. Each validator has its own file.

## Functions

### `check_input_for_special_chars(value, field_name)`
Prevents injection attacks by blocking dangerous characters.

```python
from api.utils.validation import check_input_for_special_chars

check_input_for_special_chars("user@example.com", "email")
# ✓ Pass

check_input_for_special_chars("'; DROP TABLE--", "input")
# ✗ Raises ValueError: contains invalid character: '
```

Blocked characters: `< > / \ ; ' " & | ` $`

### `validate_transaction_id(transaction_id)`
Validates transaction ID format and security.

```python
from api.utils.validation import validate_transaction_id

validate_transaction_id("TXN-12345678")  # ✓ Pass
validate_transaction_id("TXN/INJECTION")  # ✗ Raises ValueError
validate_transaction_id("toolong" * 10)   # ✗ Raises ValueError (>50 chars)
```

Rules:
- Must be string
- Cannot be empty
- Alphanumeric + hyphens + underscores only
- Max 50 characters
- No special characters

### `validate_booking_data(booking)`
Validates booking data structure and content.

```python
from api.utils.validation import validate_booking_data

booking = {
    "court_name": "Court 1",
    "date": datetime(2026, 9, 9),
    "start_time": datetime(2026, 9, 9, 10, 0),
    "end_time": datetime(2026, 9, 9, 12, 0)
}
validate_booking_data(booking)  # ✓ Pass
```

Requirements:
- All fields present: court_name, date, start_time, end_time
- All datetime fields are correct type
- end_time > start_time
