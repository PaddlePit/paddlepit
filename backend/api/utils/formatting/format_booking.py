"""Booking data formatting utilities."""
from api.utils.validation import validate_booking_data, check_input_for_special_chars
from .sanitize_string import sanitize_string


def format_booking(booking: dict) -> dict:
    """
    Format a single booking with dates and times.

    Validates booking data and formats dates/times for display.

    Args:
        booking: Booking dictionary with court_name, date, start_time, end_time

    Returns:
        Formatted booking dict with string dates and calculated duration

    Raises:
        ValueError: If booking data is invalid or cannot be formatted
    """
    from schema.utils import format_date, format_time

    try:
        # Validate booking structure
        validate_booking_data(booking)

        # Sanitize and validate court name
        court_name = sanitize_string(booking["court_name"])
        check_input_for_special_chars(court_name, "court_name")

        # Calculate duration
        hours = (booking["end_time"] - booking["start_time"]).total_seconds() / 3600

        if hours <= 0:
            raise ValueError(f"Invalid booking duration: {hours} hours")

        if hours > 24:
            raise ValueError(f"Invalid booking duration: {hours} hours exceeds 24 hour limit")

        # Return formatted booking
        return {
            "court_name": court_name,
            "date": format_date(booking["date"]),
            "start_time": format_time(booking["start_time"]),
            "end_time": format_time(booking["end_time"]),
            "total_hours": round(hours, 2),
        }
    except (ValueError, KeyError, AttributeError) as e:
        raise ValueError(f"Error formatting booking: {str(e)}")
