# Formatting Utilities

Data formatting functions to clean and structure data for display or storage.

## Functions

### `sanitize_string(value)`
Removes leading and trailing whitespace from strings.

```python
from api.utils.formatting import sanitize_string

sanitize_string("  hello world  ")  # "hello world"
sanitize_string("\n\ttab-indented\n")  # "tab-indented"
```

Simple utility for cleaning user input strings before validation.

### `format_booking(booking)`
Formats booking data with dates and times for display.

Validates and formats a booking dict, calculating duration and formatting dates/times.

```python
from api.utils.formatting import format_booking
from datetime import datetime

booking = {
    "court_name": "  Court 1  ",
    "date": datetime(2026, 9, 9),
    "start_time": datetime(2026, 9, 9, 10, 0),
    "end_time": datetime(2026, 9, 9, 12, 0)
}

formatted = format_booking(booking)
# {
#     "court_name": "Court 1",
#     "date": "2026-09-09",
#     "start_time": "10:00",
#     "end_time": "12:00",
#     "total_hours": 2.0
# }
```

**Process:**
1. Validates booking structure and times
2. Sanitizes court name
3. Checks for injection characters
4. Calculates duration in hours
5. Formats dates and times for display

**Validation:**
- Duration must be > 0 hours
- Duration cannot exceed 24 hours
- All required fields present and valid types
