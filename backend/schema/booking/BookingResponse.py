from pydantic import BaseModel
from typing import Optional
from schema.utils import format_date, format_time


class BookingTimeSlot(BaseModel):
    """Individual time slot for a booking"""
    court_name: str
    date: str  # Formatted as "Saturday, August 9 2025"
    start_time: str  # Formatted as "2:30 PM"
    end_time: str  # Formatted as "3:30 PM"
    total_hours: float

class BookingResponse(BaseModel):
    """Response for specific booking with transaction details"""
    public_transaction_id: Optional[int] = None
    email: str
    status: str
    bookings: list[BookingTimeSlot]