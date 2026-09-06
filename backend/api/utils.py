"""Helper functions for booking API"""
from datetime import datetime


def sanitize_string(value: str) -> str:
    """Sanitize string by trimming whitespace"""
    if not isinstance(value, str):
        raise ValueError(f"Expected string, got {type(value).__name__}")
    return value.strip()


def check_input_for_special_chars(value: str, field_name: str = "input") -> None:
    """Check for potentially malicious special characters in input"""
    if not isinstance(value, str):
        raise ValueError(f"{field_name} must be a string")

    dangerous_chars = ["<", ">", "/", "\\", ";", "'", '"', "&", "|", "`", "$"]

    for char in dangerous_chars:
        if char in value:
            raise ValueError(f"{field_name} contains invalid character: '{char}'")


def validate_transaction_id(transaction_id: str) -> None:
    """Validate transaction ID for security and format"""
    if not isinstance(transaction_id, str):
        raise ValueError("Transaction ID is invalid.")

    if not transaction_id:
        raise ValueError("Transaction ID cannot be empty.")

    # Check for special characters
    check_input_for_special_chars(transaction_id, "transaction_id")

    # Validate format (alphanumeric only)
    if not transaction_id.replace("-", "").replace("_", "").isalnum():
        raise ValueError("Transaction ID must contain only alphanumeric characters, hyphens, and underscores")

    if len(transaction_id) > 50:
        raise ValueError("Transaction ID is too long (max 50 characters)")


def validate_booking_data(booking: dict) -> None:
    """Validate booking data structure and content"""
    required_fields = ["court_name", "date", "start_time", "end_time"]

    for field in required_fields:
        if field not in booking:
            raise ValueError(f"Missing required field: {field}")

    if not isinstance(booking["date"], datetime):
        raise ValueError(f"Invalid date format: expected datetime, got {type(booking['date'])}")

    if not isinstance(booking["start_time"], datetime):
        raise ValueError("Invalid start_time format: expected datetime")

    if not isinstance(booking["end_time"], datetime):
        raise ValueError("Invalid end_time format: expected datetime")

    if booking["end_time"] <= booking["start_time"]:
        raise ValueError("End time must be after start time")


def format_booking(booking: dict) -> dict:
    """Format a single booking with dates and times"""
    from schema.utils import format_date, format_time

    try:
        validate_booking_data(booking)

        court_name = sanitize_string(booking["court_name"])
        check_input_for_special_chars(court_name, "court_name")

        hours = (booking["end_time"] - booking["start_time"]).total_seconds() / 3600

        if hours <= 0:
            raise ValueError(f"Invalid booking duration: {hours} hours")

        if hours > 24:
            raise ValueError(f"Invalid booking duration: {hours} hours exceeds 24 hour limit")

        return {
            "court_name": court_name,
            "date": format_date(booking["date"]),
            "start_time": format_time(booking["start_time"]),
            "end_time": format_time(booking["end_time"]),
            "total_hours": round(hours, 2),
        }
    except (ValueError, KeyError, AttributeError) as e:
        raise ValueError(f"Error formatting booking: {str(e)}")
