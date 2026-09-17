# API Directory Structure

Organized by functionality for better maintainability.

## Directory Layout

```
backend/api/
├── __init__.py
├── STRUCTURE.md (this file)
├── check_availability.py   # Availability check endpoint
├── create_booking.py       # Booking creation endpoint
├── promo.py               # Promo code validation endpoint
├── get_booking.py         # Booking retrieval endpoints
│
├── payment/               # Payment processing & webhooks
│   ├── __init__.py
│   ├── README.md         # Payment module documentation
│   ├── webhook.py        # POST /webhook/paymongo
│   └── status.py         # GET /payment/status/{booking_id}
│
├── booking/               # (future: multi-file booking operations)
│   ├── __init__.py
│   └── ...
│
└── utils/                 # Shared utilities & helpers
    ├── __init__.py       # Main exports
    │
    ├── validation/       # Input validation & security
    │   ├── __init__.py
    │   ├── README.md
    │   ├── check_input_for_special_chars.py
    │   ├── validate_transaction_id.py
    │   └── validate_booking_data.py
    │
    ├── formatting/       # Data formatting
    │   ├── __init__.py
    │   ├── README.md
    │   ├── sanitize_string.py
    │   └── format_booking.py
    │
    ├── payment/          # Payment webhook processing
    │   ├── __init__.py
    │   ├── README.md
    │   ├── store.py
    │   ├── verify_signature.py
    │   ├── handle_succeeded.py
    │   ├── handle_failed.py
    │   ├── handle_processing.py
    │   └── status.py
    │
    └── booking/          # Booking operations
        ├── __init__.py
        ├── README.md
        ├── calculate_duration.py
        ├── calculate_price.py
        └── process_payment.py
```

## File Organization

### Root API Files (Endpoints Only)

Each endpoint file contains **only routes and request/response handling**:

| File | Purpose |
|------|---------|
| `check_availability.py` | Court availability lookup |
| `create_booking.py` | Booking creation with payment |
| `promo.py` | Promo code validation |
| `get_booking.py` | Booking information retrieval |

### Payment Directory (`payment/`)

Payment-related endpoints organized by operation:

| File | Purpose |
|------|---------|
| `webhook.py` | POST /webhook/paymongo - Webhook event handler |
| `status.py` | GET /payment/status/{booking_id} - Payment status checker |

See `payment/README.md` for detailed documentation.

### Utils Directory (Organized by Function)

#### 1. Input Validation & Security (`utils/`)
- `validate_transaction_id.py` — Validate transaction IDs
- `validate_booking_data.py` — Validate booking information
- `check_input_for_special_chars.py` — Security check for special chars
- `sanitize_string.py` — Clean string data

#### 2. Data Formatting (`utils/`)
- `format_booking.py` — Format booking data for responses

#### 3. Payment Processing (`utils/webhook_helpers.py`)
- `verify_paymongo_signature()` — Verify webhook signatures
- `handle_payment_succeeded()` — Process successful payments
- `handle_payment_failed()` — Process failed payments
- `handle_payment_processing()` — Track processing status
- `get_payment_status()` — Query payment status

## Import Examples

### Import from utils in endpoint files

```python
# webhook.py
from api.utils.webhook_helpers import (
    verify_paymongo_signature,
    handle_payment_succeeded
)

# OR use utils namespace
from api.utils import verify_paymongo_signature
```

### Import in other files

```python
from api.utils import (
    sanitize_string,
    validate_transaction_id,
    format_booking
)
```

## Adding New Files

### New Endpoint
Create at root level: `api/my_endpoint.py`
- Import utilities from `api.utils`
- Define only routes with `@router.get()`, `@router.post()`, etc.

### New Utility Function
Create in `api/utils/category_name.py`:
- Group by functionality (validation, formatting, payment, etc.)
- Update `api/utils/__init__.py` with exports
- Document in `api/utils/UTILS.md`

## Naming Conventions

- **Endpoint files**: Verb + noun (e.g., `create_booking.py`, `check_availability.py`)
- **Utility files**: Describe functionality (e.g., `webhook_helpers.py`, `validate_booking_data.py`)
- **Functions**: Snake case, descriptive (e.g., `verify_paymongo_signature()`)
- **Classes**: PascalCase for exceptions or data classes

## Current Status

✅ Organized into functional groups
✅ Separation of concerns (endpoints vs utilities)
✅ Clear import structure
✅ Ready for scaling

## TODO: Future Improvements

- [ ] Move booking operations to `booking/` subdirectory when they grow large
- [ ] Create separate `payment/` utils for payment-specific functions
- [ ] Add error handling utilities
- [ ] Create email notification utilities
