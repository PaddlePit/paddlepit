"""Validate booking data structure and content."""
from datetime import datetime


def validate_booking_data(booking: dict) -> None:
    """
    Validate booking data structure and content.

    Ensures all required fields are present and have correct types.

    Args:
        booking: Booking dictionary to validate

    Raises:
        ValueError: If booking is missing fields or has invalid data
    """
    required_fields = ["court_name", "date", "start_time", "end_time"]

    # Check for required fields
    for field in required_fields:
        if field not in booking:
            raise ValueError(f"Missing required field: {field}")

    # Validate date types
    if not isinstance(booking["date"], datetime):
        raise ValueError(f"Invalid date format: expected datetime, got {type(booking['date'])}")

    if not isinstance(booking["start_time"], datetime):
        raise ValueError("Invalid start_time format: expected datetime")

    if not isinstance(booking["end_time"], datetime):
        raise ValueError("Invalid end_time format: expected datetime")

    # Validate time logic
    if booking["end_time"] <= booking["start_time"]:
        raise ValueError("End time must be after start time")
