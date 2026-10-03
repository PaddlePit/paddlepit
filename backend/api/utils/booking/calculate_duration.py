"""Calculate booking duration in hours."""
from datetime import datetime


def calculate_booking_duration_hours(start_time: datetime, end_time: datetime) -> float:
    """
    Calculate duration between start and end time in hours.

    Args:
        start_time: Booking start time
        end_time: Booking end time

    Returns:
        Duration in hours (float)

    Raises:
        ValueError: If end_time is not after start_time
    """
    delta = end_time - start_time
    hours = delta.total_seconds() / 3600

    if hours <= 0:
        raise ValueError("End time must be after start time")

    return hours
