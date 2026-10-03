"""Calculate booking price based on court and duration."""
from pydantic import BaseModel
from datetime import datetime
from api.utils.booking.calculate_duration import calculate_booking_duration_hours
from services.court_service import CourtService


class BookingItem(BaseModel):
    """Booking item data structure."""
    court_id: str
    start_time: datetime
    end_time: datetime


def calculate_booking_price(booking_items: list[BookingItem]) -> float:
    """
    Calculate total price for all booking items.

    Price = Sum of (court_rate × duration_hours) for each court

    Args:
        booking_items: List of booking items with court, start time, and end time

    Returns:
        Total price in pesos (float)

    Raises:
        ValueError: If court_id is invalid or time range is invalid
    """
    court_service = CourtService()
    total = 0.0

    for item in booking_items:
        # Validate court exists and get its rate
        court = court_service.get_court(item.court_id)
        if not court:
            raise ValueError(f"Invalid court ID: {item.court_id}")

        # Calculate duration
        duration_hours = calculate_booking_duration_hours(item.start_time, item.end_time)

        # Calculate price for this court
        court_rate = court["hourly_rate"]
        total += court_rate * duration_hours

    return total


def get_court_rate(court_id: str) -> float:
    """
    Get hourly rate for a specific court.

    Args:
        court_id: Court identifier

    Returns:
        Hourly rate in pesos

    Raises:
        ValueError: If court_id is invalid
    """
    court_service = CourtService()
    court = court_service.get_court(court_id)

    if not court:
        raise ValueError(f"Invalid court ID: {court_id}")

    return court["hourly_rate"]
