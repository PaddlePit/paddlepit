"""Booking date validation utilities."""
from datetime import datetime
from fastapi import HTTPException


def validate_booking_dates(booking_items: list) -> None:
    """
    Validate that booking dates are in the future and logically consistent.
    All datetimes are treated as local timezone (naive).

    Args:
        booking_items: List of booking items with start_time and end_time

    Raises:
        HTTPException: If dates are invalid (past or end before start)
    """
    now = datetime.utcnow()

    for item in booking_items:
        if item.start_time <= now:
            raise HTTPException(
                status_code=400,
                detail=f"Booking start time must be in the future."
            )
        if item.end_time <= item.start_time:
            raise HTTPException(
                status_code=400,
                detail="End time must be after start time"
            )
